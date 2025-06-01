import { save } from '@tauri-apps/plugin-dialog';
import { rename, writeFile, open as openFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { TAURI_MOBILE, log } from './tauri.ts';
import * as filesMobile from './files-mobile.ts';

interface PermissionStatus {
	writeExternalStorage: 'granted' | 'denied' | 'prompt';
	readExternalStorage: 'granted' | 'denied' | 'prompt';
}

enum PermissionType {
	WriteExternalStorage = 'writeExternalStorage',
	ReadExternalStorage = 'readExternalStorage',
}

export class NativeDownload {
	public original_file_name: string;
	public file_path: string;
	public temp_file_path: string;
	public potential_default_folder: null | string = null;
	public finished: boolean = false;
	public baseDir: BaseDirectory;
	// For mobile mode
	public mobileDownload?: filesMobile.MobileDownload;

	constructor() {
		this.original_file_name = '';
		this.file_path = '';
		this.temp_file_path = '';
		// Default to Download directory, will be overridden for Android
		this.baseDir = BaseDirectory.Download;
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

export async function offerNativeDownload(fileName: string, defaultFileDownloadFolder: string | null): Promise<NativeDownload | { error: string } | null> {
	log.debug('offerNativeDownload - TAURI_MOBILE:', TAURI_MOBILE);

	// Ensure we have file permissions before proceeding
	const permissionResult = await ensureFilePermissions();
	if (!permissionResult.success) {
		return { error: permissionResult.error || 'File permissions not available' };
	}

	const download = new NativeDownload();
	download.original_file_name = fileName;

	// On mobile, use the mobile-specific implementation
	if (TAURI_MOBILE) {
		try {
			const mobileResult = await filesMobile.createDownloadFile(fileName);

			if ('error' in mobileResult) {
				return { error: mobileResult.error };
			}

			// Store the mobile download info and also populate the common fields
			download.mobileDownload = mobileResult;
			download.file_path = mobileResult.fileName;
			download.temp_file_path = mobileResult.tempFileName;
			download.baseDir = BaseDirectory.AppData; // Mobile uses app data directory

			log.debug('Mobile download created:', {
				file_path: download.file_path,
				temp_file_path: download.temp_file_path,
				mobileDownload: download.mobileDownload,
			});

			return download;
		} catch (error) {
			log.debug('Failed to create mobile download:', error);
			return { error: 'Failed to create mobile download: ' + error };
		}
	}

	// Desktop-only code path
	if (defaultFileDownloadFolder) {
		await findFreeFileName(defaultFileDownloadFolder, download);
		return download;
	} else {
		let p = await save({
			defaultPath: defaultFileDownloadFolder ? await path.join(defaultFileDownloadFolder, fileName) : fileName,
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
		return download;
	}
}

export async function saveNativeDownloadChunk(download: NativeDownload, chunk: Blob) {
	if (download.finished) {
		throw new Error('Download already finished');
	}

	// Use mobile implementation if on mobile
	if (TAURI_MOBILE && download.mobileDownload) {
		await filesMobile.appendToDownload(download.mobileDownload, chunk);
		return;
	}

	// Desktop implementation
	const file_path = download.temp_file_path;
	const file = await openFile(file_path, {
		append: true,
		baseDir: download.baseDir,
	});
	await file.write(new Uint8Array(await chunk.arrayBuffer()));
	await file.close();
}

export async function finishNativeDownload(download: NativeDownload) {
	if (download.finished) {
		return; // Already finished
	}

	download.finished = true;

	// Use mobile implementation if on mobile
	if (TAURI_MOBILE && download.mobileDownload) {
		await filesMobile.finishDownload(download.mobileDownload);
		log.debug('Mobile download finished:', download.file_path);

		// Important: For mobile, we only notify the user that the download is finished
		// The user will need to take explicit action to export the file using exportToSystemDownloads
		try {
			// You can implement a notification here using Tauri notifications API
			// For now, we just log that the file is ready
			log.debug('Download complete - file is available for export', {
				fileName: download.original_file_name,
				path: download.file_path,
			});

			// Note: You can call the system notification API here if desired
			// This could display a message like "Download complete, tap to export"
		} catch (error) {
			log.debug('Failed to notify about completed download:', error);
		}

		return;
	}

	// Desktop implementation
	const file_path = download.file_path;
	const temp_file_path = download.temp_file_path;

	log.debug('Finishing desktop download - paths:', {
		file_path,
		temp_file_path,
		baseDir: download.baseDir,
	});

	await rename(temp_file_path, file_path, {
		oldPathBaseDir: download.baseDir,
		newPathBaseDir: download.baseDir,
	});
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
		// Use our plugin to export the file using streaming (no memory loading)
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
