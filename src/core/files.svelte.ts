import { save } from '@tauri-apps/plugin-dialog';
import { rename, writeFile, open as openFile, exists, BaseDirectory, remove, stat } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { appDataDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { TAURI_MOBILE, log } from './tauri.ts';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { get } from 'svelte/store';

// Store for default download folder
export const defaultDownloadFolder = localStorageSharedStore('defaultDownloadFolder', '');

// Mutex for download creation operations to prevent concurrent filename conflicts
let createDownloadMutex: Promise<any> | null = null;

// Generic mutex wrapper for download creation operations
async function withDownloadMutex<T>(operation: () => Promise<T>): Promise<T> {
	// Wait for any existing download creation operation to complete
	if (createDownloadMutex) {
		log.debug('Waiting for existing download creation operation to complete');
		try {
			await createDownloadMutex;
		} catch (error) {
			// Ignore errors from previous operations
			log.debug('Previous download creation operation failed, continuing');
		}
	}

	// Create a new mutex promise for this operation
	const currentOperation = operation();
	createDownloadMutex = currentOperation;

	try {
		const result = await currentOperation;
		return result;
	} finally {
		// Clear the mutex when this operation completes
		if (createDownloadMutex === currentOperation) {
			createDownloadMutex = null;
		}
	}
}

interface PermissionStatus {
	writeExternalStorage: 'granted' | 'denied' | 'prompt';
	readExternalStorage: 'granted' | 'denied' | 'prompt';
}

enum PermissionType {
	WriteExternalStorage = 'writeExternalStorage',
	ReadExternalStorage = 'readExternalStorage',
}

// Generate a simple UUID-like string that works in HTTP contexts
function generateId(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

// Convert a Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
	const arrayBuffer = await blob.arrayBuffer();
	const bytes = new Uint8Array(arrayBuffer);
	let binary = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

// Desktop-specific helper: Create download with default folder
async function createDownloadWithFolderDesktop(fileName: string, folder: string): Promise<NativeDownload> {
	const download = new NativeDownload();
	download.original_file_name = fileName;
	await findFreeFileName(folder, download);
	return download;
}

// Desktop-specific helper: Create download with save dialog
async function createDownloadWithDialogDesktop(fileName: string): Promise<NativeDownload | null> {
	const download = new NativeDownload();
	download.original_file_name = fileName;

	// Show save dialog
	const p = await save({
		defaultPath: fileName,
		canCreateDirectories: true,
		title: 'Save file',
	});

	if (!p) {
		return null;
	}

	download.file_path = p;
	download.temp_file_path = partFileName(p);
	download.potential_default_folder = await path.dirname(p);

	await writeFile(download.temp_file_path, new Uint8Array(), { baseDir: download.baseDir });
	download.current_size = 0; // Empty file starts at 0 bytes
	return download;
}

export class NativeDownload {
	public id: string = generateId();
	public original_file_name: string = $state('');
	public file_path: string = $state('');
	public temp_file_path: string = $state('');
	public potential_default_folder: null | string = $state(null);
	public finished: boolean = $state(false);
	public current_size: number = $state(0);
	public baseDir: BaseDirectory = $state(BaseDirectory.Download);

	constructor() {}

	public toJSON() {
		return {
			id: this.id,
			original_file_name: this.original_file_name,
			file_path: this.file_path,
			temp_file_path: this.temp_file_path,
			potential_default_folder: this.potential_default_folder,
			finished: this.finished,
			current_size: this.current_size,
			baseDir: this.baseDir,
		};
	}
}

async function ensureFilePermissions(): Promise<{ success: boolean; error?: string }> {
	if (!TAURI_MOBILE) {
		return { success: true }; // Desktop always has permissions
	}

	try {
		log.debug('Attempting to invoke plugin:yellow|check_file_permissions');
		const permissions = await invoke<PermissionStatus>('plugin:yellow|check_file_permissions');
		log.debug('check_file_permissions result:', permissions);
		if (permissions.writeExternalStorage !== 'granted' || permissions.readExternalStorage !== 'granted') {
			log.debug('Permissions not granted, requesting...');
			const result = await invoke<PermissionStatus>('plugin:yellow|request_file_permissions', {
				permissions: [PermissionType.WriteExternalStorage, PermissionType.ReadExternalStorage],
			});
			log.debug('request_file_permissions result:', result);
			if (result.writeExternalStorage === 'granted' && result.readExternalStorage === 'granted') {
				return { success: true };
			} else {
				return { success: false, error: 'File permissions denied by user' };
			}
		}
		return { success: true };
	} catch (error) {
		log.debug('Failed to check/request file permissions:', error);
		log.debug('Error details:', JSON.stringify(error, null, 2));
		return {
			success: false,
			error: `Failed to check file permissions: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}

// Mobile-specific helper: Check if a file exists
async function checkFileExistsMobile(fileName: string): Promise<boolean> {
	const baseDir = BaseDirectory.AppData;

	log.debug('Checking if file exists (mobile):', {
		fileName,
		baseDir,
	});

	try {
		const result = await invoke('plugin:yellow|file_exists', {
			fileName,
		});

		const exists = result === true;
		/*		log.debug('File existence check result:', {
			fileName,
			baseDir: 'AppData',
			exists,
			rawResult: result,
		});*/

		return exists;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorStr = JSON.stringify(error, null, 2);
		log.debug('Error checking file existence:', errorMessage);
		log.debug('Error details:', errorStr);
		throw new Error(`File system error checking existence of "${fileName}": ${errorMessage}`);
	}
}

// Mobile-specific helper: Find a free filename
async function findFreeFileNameMobile(baseFileName: string): Promise<{ fileName: string } | { error: string }> {
	log.debug('Starting findFreeFileName (mobile):', {
		baseFileName,
	});

	try {
		let counter = 0;
		let fileName = baseFileName;

		while (true) {
			log.debug(`Checking file existence (attempt ${counter + 1}):`, {
				fileName,
				counter,
			});

			try {
				const exists = await checkFileExistsMobile(fileName);
				const tempExists = await checkFileExistsMobile(`${fileName}.part`);

				/*				log.debug('File existence check results:', {
					fileName,
					tempFileName: `${fileName}.part`,
					exists,
					tempExists,
				});*/

				if (!exists && !tempExists) {
					log.debug('Found free filename:', { fileName });
					return { fileName };
				}

				// Generate a new filename with counter
				counter++;
				const nameParts = baseFileName.match(/^(.+?)(\.[^.]+)?$/);
				if (nameParts) {
					fileName = `${nameParts[1]} (${counter})${nameParts[2] || ''}`;
				} else {
					fileName = `${baseFileName} (${counter})`;
				}
				log.debug(`File already exists, trying new filename:`, { fileName, counter });
			} catch (fileCheckError) {
				const errorMessage = fileCheckError instanceof Error ? fileCheckError.message : String(fileCheckError);
				log.debug('Serious error during file existence check:', errorMessage);
				return { error: `File system error during filename check: ${errorMessage}` };
			}

			if (counter > 100) {
				log.debug('Reached maximum number of filename attempts (100)');
				return { error: 'Could not find a free filename after 100 attempts' };
			}
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		log.debug('Error finding free filename:', errorMessage);
		log.debug('Error details:', JSON.stringify(error, null, 2));
		return { error: `Failed to find free filename: ${errorMessage}` };
	}
}

// Internal implementation of createDownloadFileMobile
async function createDownloadFileMobileInternal(fileName: string): Promise<NativeDownload | { error: string }> {
	log.debug('Creating download file (mobile):', { fileName });

	const baseDir = BaseDirectory.AppData;
	const justFileName = fileName.split('/').pop() || fileName;

	const result = await findFreeFileNameMobile(justFileName);
	if ('error' in result) {
		log.debug('Error finding free filename:', result.error);
		return { error: result.error };
	}

	const { fileName: finalFileName } = result;
	const tempFileName = `${finalFileName}.part`;

	log.debug('Found free filename, creating temp file:', {
		finalFileName,
		tempFileName,
	});

	try {
		let appDataPath = '';
		try {
			appDataPath = await appDataDir();
			log.debug('App data directory:', appDataPath);
		} catch (pathError) {
			log.debug('Could not get app data directory path:', pathError);
		}

		await invoke('plugin:yellow|create_file', {
			fileName: tempFileName,
			content: '',
			baseDir: baseDir,
		});

		log.debug('Successfully created temp file');

		const download = new NativeDownload();
		download.original_file_name = fileName;
		download.file_path = finalFileName;
		download.temp_file_path = tempFileName;
		download.baseDir = baseDir;
		download.finished = false;
		download.current_size = 0; // Empty file starts at 0 bytes

		return download;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		log.debug('Failed to create download file:', errorMessage);
		log.debug('Error details:', JSON.stringify(error, null, 2));

		if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
			return { error: 'Permission denied: Cannot create file. Please check app permissions.' };
		} else if (errorMessage.includes('storage') || errorMessage.includes('space') || errorMessage.includes('disk full')) {
			return { error: 'Not enough storage space available to create file.' };
		} else if (errorMessage.includes('invalid') && errorMessage.includes('path')) {
			return { error: `Invalid file path: "${tempFileName}". File name may contain invalid characters.` };
		}

		return { error: `Failed to create file: ${errorMessage}` };
	}
}

export async function offerNativeDownload(fileName: string): Promise<NativeDownload | { error: string } | null> {
	log.debug('offerNativeDownload - TAURI_MOBILE:', TAURI_MOBILE);

	// Ensure we have file permissions before proceeding
	const permissionResult = await ensureFilePermissions();
	if (!permissionResult.success) {
		return { error: permissionResult.error || 'File permissions not available' };
	}

	if (TAURI_MOBILE) {
		return withDownloadMutex(() => createDownloadFileMobileInternal(fileName));
	} else {
		return withDownloadMutex(async () => {
			const folderToUse = get(defaultDownloadFolder);

			if (folderToUse) {
				return createDownloadWithFolderDesktop(fileName, folderToUse);
			} else {
				return createDownloadWithDialogDesktop(fileName);
			}
		});
	}
}

// Mobile-specific helper: Save download chunk
async function saveNativeDownloadChunkMobile(download: NativeDownload, chunk: Blob): Promise<any> {
	const base64Data = await blobToBase64(chunk);

	log.debug('Appending chunk to download file (mobile):', {
		downloadId: download.id,
		fileName: download.temp_file_path,
		chunkSize: chunk.size,
		baseDir: download.baseDir,
	});

	await invoke('plugin:yellow|append_to_file', {
		fileName: download.temp_file_path,
		data: base64Data,
		baseDir: download.baseDir,
	});

	// Get current file size after writing
	try {
		const currentSizeResult = await invoke('plugin:yellow|get_file_size', {
			fileName: download.temp_file_path,
		});
		download.current_size = currentSizeResult as number;
		log.debug('Chunk saved successfully (mobile):', {
			downloadId: download.id,
			fileName: download.temp_file_path,
			chunkSize: chunk.size,
			currentFileSize: download.current_size,
		});
		return currentSizeResult;
	} catch (error) {
		log.debug('Could not get file size after chunk save (mobile):', {
			downloadId: download.id,
			chunkSize: chunk.size,
			error,
		});
	}
}

// Desktop-specific helper: Save download chunk
async function saveNativeDownloadChunkDesktop(download: NativeDownload, chunk: Blob): Promise<any> {
	log.debug('Appending chunk to download file (desktop):', {
		downloadId: download.id,
		fileName: download.temp_file_path,
		chunkSize: chunk.size,
		baseDir: download.baseDir,
	});

	const file = await openFile(download.temp_file_path, {
		append: true,
		baseDir: download.baseDir,
	});
	const chunkData = new Uint8Array(await chunk.arrayBuffer());
	await file.write(chunkData);
	await file.close();

	// Get current file size after writing (for desktop, use stat to get proper file size)
	try {
		const fileStat = await stat(download.temp_file_path, { baseDir: download.baseDir });
		log.debug('File stat after chunk save (desktop):', fileStat);

		download.current_size = fileStat.size;
		log.debug('Chunk saved successfully (desktop):', {
			downloadId: download.id,
			fileName: download.temp_file_path,
			chunkSize: chunk.size,
			currentFileSize: download.current_size,
		});

		return fileStat;
	} catch (error) {
		log.debug('Chunk saved successfully (desktop, size check failed):', {
			downloadId: download.id,
			chunkSize: chunk.size,
			error,
		});
	}
}

export async function saveNativeDownloadChunk(download: NativeDownload, chunk: Blob) {
	if (download.finished) {
		throw new Error('Download already finished');
	}

	if (TAURI_MOBILE) {
		return saveNativeDownloadChunkMobile(download, chunk);
	} else {
		return saveNativeDownloadChunkDesktop(download, chunk);
	}
}

// Mobile-specific helper: Finish download
async function finishNativeDownloadMobile(download: NativeDownload): Promise<any> {
	log.debug('Finishing download by renaming temp file (mobile):', {
		downloadId: download.id,
		oldName: download.temp_file_path,
		newName: download.file_path,
		baseDir: download.baseDir,
	});

	await invoke('plugin:yellow|rename_file', {
		oldName: download.temp_file_path,
		newName: download.file_path,
		baseDir: download.baseDir,
	});

	log.debug('Mobile download finished:', {
		downloadId: download.id,
		fileName: download.original_file_name,
		path: download.file_path,
	});

	try {
		log.debug('Download complete - file is available for export (mobile)', {
			downloadId: download.id,
			fileName: download.original_file_name,
			path: download.file_path,
		});

		// Note: You can call the system notification API here if desired
		// This could display a message like "Download complete, tap to export"

		return 'ok';
	} catch (error) {
		log.debug('Failed to notify about completed download (mobile):', {
			downloadId: download.id,
			error,
		});
	}
}

// Desktop-specific helper: Finish download
async function finishNativeDownloadDesktop(download: NativeDownload): Promise<void> {
	const file_path = download.file_path;
	const temp_file_path = download.temp_file_path;

	log.debug('Finishing desktop download - paths:', {
		downloadId: download.id,
		file_path,
		temp_file_path,
		baseDir: download.baseDir,
	});

	await rename(temp_file_path, file_path, {
		oldPathBaseDir: download.baseDir,
		newPathBaseDir: download.baseDir,
	});

	log.debug('Desktop download finished:', {
		downloadId: download.id,
		fileName: download.original_file_name,
		path: download.file_path,
	});
}

export async function finishNativeDownload(download: NativeDownload) {
	if (download.finished) {
		return 'Download already finished';
	}

	download.finished = true;

	if (TAURI_MOBILE) {
		return finishNativeDownloadMobile(download);
	} else {
		return finishNativeDownloadDesktop(download);
	}
}

async function findFreeFileName(folder: string, download: NativeDownload) {
	log.debug('Starting findFreeFileName (desktop):', {
		folder,
		original_file_name: download.original_file_name,
		baseDir: download.baseDir,
	});

	let counter = 0;
	while (true) {
		let file_name = download.original_file_name + (counter > 0 ? ` (${counter})` : '');
		const file_path = await path.join(folder, file_name);

		log.debug(`Checking file existence (attempt ${counter + 1}):`, {
			file_name,
			file_path,
			counter,
		});

		const exists_file = await exists(file_path, { baseDir: download.baseDir });
		const temp_file_path = partFileName(file_path);
		const exists_file2 = await exists(temp_file_path, { baseDir: download.baseDir });

		log.debug('File existence check results:', {
			file_path,
			temp_file_path,
			exists_file,
			exists_file2,
		});

		if (!exists_file && !exists_file2) {
			log.debug('Found free filename:', {
				file_path,
				temp_file_path,
			});

			download.file_path = file_path;
			download.temp_file_path = temp_file_path;
			try {
				// Create the temp file
				log.debug('Creating temp file:', temp_file_path);
				await writeFile(download.temp_file_path, new Uint8Array(), { baseDir: download.baseDir });
				download.current_size = 0; // Empty file starts at 0 bytes
				log.debug('Temp file created successfully');
			} catch (error) {
				log.debug('Failed to create temp file in findFreeFileName:', error);
				log.debug('Error details:', JSON.stringify(error, null, 2));
				throw error;
			}
			log.debug('findFreeFileName completed successfully', {
				final_path: download.file_path,
				temp_path: download.temp_file_path,
			});
			return;
		}

		log.debug(`File already exists, trying next counter value: ${counter + 1}`);
		counter++;

		// Safety check to prevent infinite loops
		if (counter > 100) {
			log.debug('Reached maximum number of filename attempts (100)');
			throw new Error('Could not find a free filename after 100 attempts');
		}
	}
}

function partFileName(file_path: string) {
	return file_path + '.part';
}

// Export a file from app storage to system Downloads folder (mobile only)
export async function exportToSystemDownloads(appFilePath: string, fileName: string, mimeType: string = 'application/octet-stream'): Promise<{ success: boolean; error?: string }> {
	if (!TAURI_MOBILE) {
		return { success: false, error: 'This function is only for mobile devices' };
	}

	try {
		const result = await invoke('plugin:yellow|export_file_to_downloads', {
			filePath: appFilePath,
			fileName: fileName,
			mimeType: mimeType,
		});

		log.debug('File exported to Downloads:', result);
		return { success: true };
	} catch (error) {
		log.debug('Failed to export to Downloads:', error);
		return { success: false, error: error instanceof Error ? error.message : String(error) };
	}
}

// Unified API: Export file with system dialog (mobile and desktop)
export async function exportFileWithDialog(fileName: string, mimeType: string = 'application/octet-stream'): Promise<{ success: boolean; error?: string }> {
	if (TAURI_MOBILE) {
		const baseDir = BaseDirectory.AppData;

		log.debug('Opening export dialog for file:', {
			fileName,
			mimeType,
			baseDir: 'AppData',
		});

		try {
			// Open save dialog
			const dialogResult = (await invoke('plugin:yellow|open_save_dialog', {
				fileName,
				mimeType,
				baseDir,
			})) as { success: boolean; uri?: string; fileName?: string; mimeType?: string };

			if (!dialogResult.success || !dialogResult.uri) {
				log.debug('Save dialog cancelled by user');
				return { success: false, error: 'Save dialog cancelled' };
			}

			log.debug('User selected destination, saving file to URI:', dialogResult.uri);

			// Save the file to the selected URI
			await invoke('plugin:yellow|save_file_to_uri', {
				filePath: fileName,
				uri: dialogResult.uri,
				baseDir,
			});

			log.debug('File exported successfully to:', dialogResult.uri);
			return { success: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			log.debug('Failed to export file:', errorMessage);
			log.debug('Error details:', JSON.stringify(error, null, 2));
			return { success: false, error: errorMessage };
		}
	} else {
		return { error: 'This function is only for mobile devices', success: false };
	}
}

// Mobile-specific helper: Append string content to file
async function appendToFileMobile(fileName: string, content: string): Promise<void> {
	const baseDir = BaseDirectory.AppData;

	log.debug('Appending string content to file (mobile):', {
		fileName,
		contentLength: content.length,
		baseDir: 'AppData',
	});

	await invoke('plugin:yellow|append_to_file', {
		fileName,
		data: btoa(content), // Convert string to base64
		baseDir,
	});

	log.debug('Content appended successfully (mobile):', {
		fileName,
		contentLength: content.length,
	});
}

// Desktop-specific helper: Append string content to file
async function appendToFileDesktop(fileName: string, content: string): Promise<void> {
	log.debug('Appending string content to file (desktop):', {
		fileName,
		contentLength: content.length,
	});

	const filePath = await path.join(await path.downloadDir(), fileName);
	const file = await openFile(filePath, {
		append: true,
		baseDir: BaseDirectory.Download,
	});

	const encoder = new TextEncoder();
	await file.write(encoder.encode(content));
	await file.close();

	log.debug('Content appended successfully (desktop):', {
		fileName,
		contentLength: content.length,
	});
}

// Unified API: Append string content to a file
export async function appendToFile(fileName: string, content: string): Promise<void> {
	if (TAURI_MOBILE) {
		return appendToFileMobile(fileName, content);
	} else {
		return appendToFileDesktop(fileName, content);
	}
}

// Mobile-specific helper: Rename a file
async function renameFileMobile(oldName: string, newName: string): Promise<void> {
	const baseDir = BaseDirectory.AppData;

	log.debug('Renaming file (mobile):', {
		oldName,
		newName,
		baseDir: 'AppData',
	});

	await invoke('plugin:yellow|rename_file', {
		oldName,
		newName,
		baseDir,
	});

	log.debug('File renamed successfully (mobile):', {
		oldName,
		newName,
	});
}

// Desktop-specific helper: Rename a file
async function renameFileDesktop(oldName: string, newName: string): Promise<void> {
	log.debug('Renaming file (desktop):', {
		oldName,
		newName,
	});

	const oldPath = await path.join(await path.downloadDir(), oldName);
	const newPath = await path.join(await path.downloadDir(), newName);

	await rename(oldPath, newPath, {
		oldPathBaseDir: BaseDirectory.Download,
		newPathBaseDir: BaseDirectory.Download,
	});

	log.debug('File renamed successfully (desktop):', {
		oldName,
		newName,
	});
}

// Unified API: Rename a file
export async function renameFile(oldName: string, newName: string): Promise<void> {
	if (TAURI_MOBILE) {
		return renameFileMobile(oldName, newName);
	} else {
		return renameFileDesktop(oldName, newName);
	}
}

// Mobile-specific helper: Delete a file
async function deleteFileMobile(fileName: string): Promise<void> {
	const baseDir = BaseDirectory.AppData;

	log.debug('Deleting file (mobile):', {
		fileName,
		baseDir: 'AppData',
	});

	await invoke('plugin:yellow|delete_file', {
		fileName,
		baseDir,
	});

	log.debug('File deleted successfully (mobile):', {
		fileName,
	});
}

// Desktop-specific helper: Delete a file
async function deleteFileDesktop(fileName: string): Promise<void> {
	log.debug('Deleting file (desktop):', {
		fileName,
	});

	const filePath = await path.join(await path.downloadDir(), fileName);
	await remove(filePath, { baseDir: BaseDirectory.Download });

	log.debug('File deleted successfully (desktop):', {
		fileName,
	});
}

// Unified API: Delete a file
export async function deleteFile(fileName: string): Promise<void> {
	if (TAURI_MOBILE) {
		return deleteFileMobile(fileName);
	} else {
		return deleteFileDesktop(fileName);
	}
}

// Desktop-specific helper: Create download file in downloads folder
async function createDownloadFileDesktop(fileName: string): Promise<NativeDownload> {
	const downloadsDir = await path.downloadDir();
	const download = new NativeDownload();
	download.original_file_name = fileName;

	await findFreeFileName(downloadsDir, download);
	const contentBytes = new TextEncoder().encode('');
	await writeFile(download.temp_file_path, contentBytes, {
		baseDir: download.baseDir,
	});

	return download;
}

// Unified API: Create a download file with initial content
export async function createDownloadFile(fileName: string): Promise<NativeDownload | { error: string }> {
	// For mobile, delegate to the mobile-specific implementation (already has mutex protection)
	if (TAURI_MOBILE) {
		const result = await withDownloadMutex(() => createDownloadFileMobileInternal(fileName));

		if ('error' in result) {
			return result;
		}

		await appendToFile(result.file_path, '');
		return result;
	}

	// Desktop implementation: create in downloads folder (with mutex protection)
	return withDownloadMutex(() => createDownloadFileDesktop(fileName));
}
