import { invoke } from '@tauri-apps/api/core';
import { TAURI_MOBILE, log } from './tauri.ts';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { appDataDir, resolve } from '@tauri-apps/api/path';

export interface MobileDownload {
	fileName: string; // Just the filename without path
	tempFileName: string; // Just the temp filename without path
	finished: boolean;
	// New fields to track full paths
	fullPath?: string; // Full path including directory (for reference only)
	baseDir: BaseDirectory; // The base directory context
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

// Create a new file for download
export async function createDownloadFile(fileName: string): Promise<MobileDownload | { error: string }> {
	if (!TAURI_MOBILE) {
		return { error: 'This function is only for mobile platforms' };
	}

	log.debug('Creating download file:', { fileName });

	// Always use AppData as the base directory for mobile downloads
	const baseDir = BaseDirectory.AppData;

	// Get just the filename without any path components
	const justFileName = fileName.split('/').pop() || fileName;

	// Find a free filename to avoid conflicts
	const result = await findFreeFileName(justFileName);
	if ('error' in result) {
		log.debug('Error finding free filename:', result.error);
		return result;
	}

	const { fileName: finalFileName } = result;
	const tempFileName = `${finalFileName}.part`;

	log.debug('Found free filename, creating temp file:', {
		finalFileName,
		tempFileName,
		baseDir: 'AppData',
	});

	try {
		// Get app data directory path for reference (not used directly in commands)
		let appDataPath = '';
		try {
			appDataPath = await appDataDir();
			log.debug('App data directory:', appDataPath);
		} catch (pathError) {
			log.debug('Could not get app data directory path:', pathError);
		}

		// Create empty file (note: the plugin:yellow commands work with base paths internally)
		await invoke('plugin:yellow|create_file', {
			fileName: tempFileName,
			content: '',
			baseDir: baseDir, // Pass base directory context
		});

		log.debug('Successfully created temp file');

		// Build full path for reference only
		let fullPath = '';
		try {
			fullPath = await resolve(appDataPath, finalFileName);
		} catch (resolveError) {
			log.debug('Could not resolve full path (non-critical):', resolveError);
		}

		return {
			fileName: finalFileName,
			tempFileName,
			finished: false,
			fullPath,
			baseDir,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		log.debug('Failed to create download file:', errorMessage);
		log.debug('Error details:', JSON.stringify(error, null, 2));

		// Check for specific error types and provide more helpful messages
		if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
			return { error: 'Permission denied: Cannot create file. Please check app permissions.' };
		} else if (errorMessage.includes('storage') || errorMessage.includes('space') || errorMessage.includes('disk full')) {
			return { error: 'Not enough storage space available to create file.' };
		} else if (errorMessage.includes('invalid') && errorMessage.includes('path')) {
			return { error: `Invalid file path: "${tempFileName}". File name may contain invalid characters.` };
		}

		// Generic error
		return { error: `Failed to create file: ${errorMessage}` };
	}
}

// Find a free filename that doesn't exist yet
async function findFreeFileName(baseFileName: string): Promise<{ fileName: string } | { error: string }> {
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
				// Check if file exists - may throw errors for serious filesystem issues
				const exists = await checkFileExists(fileName);
				const tempExists = await checkFileExists(`${fileName}.part`);

				log.debug('File existence check results:', {
					fileName,
					tempFileName: `${fileName}.part`,
					exists,
					tempExists,
				});

				if (!exists && !tempExists) {
					log.debug('Found free filename:', { fileName });
					return { fileName };
				}

				// Generate a new filename with counter
				counter++;
				fileName = baseFileName.replace(/(\.[^.]+)?$/, ` (${counter})$&`);
				log.debug(`File already exists, trying new filename:`, { fileName, counter });
			} catch (fileCheckError) {
				// This is a serious filesystem error that was propagated from checkFileExists
				const errorMessage = fileCheckError instanceof Error ? fileCheckError.message : String(fileCheckError);
				log.debug('Serious error during file existence check:', errorMessage);
				return { error: `File system error during filename check: ${errorMessage}` };
			}

			// Safety check to prevent infinite loops
			if (counter > 100) {
				log.debug('Reached maximum number of filename attempts (100)');
				return { error: 'Could not find a free filename after 100 attempts' };
			}
		}
	} catch (error) {
		// General error in the findFreeFileName function itself
		const errorMessage = error instanceof Error ? error.message : String(error);
		log.debug('Error finding free filename:', errorMessage);
		log.debug('Error details:', JSON.stringify(error, null, 2));
		return { error: `Failed to find free filename: ${errorMessage}` };
	}
}

// Check if a file exists
async function checkFileExists(fileName: string): Promise<boolean> {
	// Always use AppData as the base directory for mobile files
	const baseDir = BaseDirectory.AppData;

	log.debug('Checking if file exists:', {
		fileName,
		baseDir: 'AppData',
	});

	try {
		const result = await invoke('plugin:yellow|file_exists', {
			fileName,
			baseDir,
		});

		const exists = !!result;
		log.debug('File existence check result:', {
			fileName,
			baseDir: 'AppData',
			exists,
			rawResult: result,
		});

		return exists;
	} catch (error) {
		// Check if this is a "file not found" error vs. a more serious error
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorStr = JSON.stringify(error, null, 2);
		log.debug('Error checking file existence:', errorMessage);
		log.debug('Error details:', errorStr);

		// If error message indicates a file not found error, that's expected
		if (errorMessage.includes('not found') || errorMessage.includes('does not exist') || errorMessage.includes('no such file')) {
			log.debug('File does not exist based on error message');
			return false;
		}

		// If it's a more serious error (permissions, storage full, etc.),
		// propagate the error instead of silently failing
		if (errorMessage.includes('permission') || errorMessage.includes('access denied') || errorMessage.includes('storage') || errorMessage.includes('disk full') || errorMessage.includes('i/o error')) {
			log.debug('Serious file system error detected, propagating error');
			throw new Error(`File system error checking existence of "${fileName}": ${errorMessage}`);
		}

		// For any other error types, log a warning and cautiously return false
		log.debug('Unrecognized file existence error, defaulting to false but with warning');
		return false;
	}
}

// Append data to download file
export async function appendToDownload(download: MobileDownload, chunk: Blob): Promise<void> {
	if (download.finished) {
		throw new Error('Download already finished');
	}

	const base64Data = await blobToBase64(chunk);

	log.debug('Appending chunk to download file:', {
		fileName: download.tempFileName,
		chunkSize: chunk.size,
		baseDir: download.baseDir ?? 'AppData',
	});

	await invoke('plugin:yellow|append_to_file', {
		fileName: download.tempFileName,
		data: base64Data,
		baseDir: download.baseDir ?? BaseDirectory.AppData,
	});
}

// Finish download by renaming temp file
export async function finishDownload(download: MobileDownload): Promise<void> {
	if (download.finished) {
		throw new Error('Download already finished');
	}

	log.debug('Finishing download by renaming temp file:', {
		oldName: download.tempFileName,
		newName: download.fileName,
		baseDir: download.baseDir ?? 'AppData',
	});

	await invoke('plugin:yellow|rename_file', {
		oldName: download.tempFileName,
		newName: download.fileName,
		baseDir: download.baseDir ?? BaseDirectory.AppData,
	});

	download.finished = true;
	log.debug('Download finished successfully');
}

// Export file with save dialog
export async function exportFileWithDialog(fileName: string, mimeType: string = 'application/octet-stream'): Promise<{ success: boolean; error?: string }> {
	if (!TAURI_MOBILE) {
		return { success: false, error: 'This function is only for mobile platforms' };
	}

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
}

// Delete a file
export async function deleteFile(fileName: string): Promise<void> {
	const baseDir = BaseDirectory.AppData;

	log.debug('Deleting file:', {
		fileName,
		baseDir: 'AppData',
	});

	await invoke('plugin:yellow|delete_file', {
		fileName,
		baseDir,
	});

	log.debug('File deleted successfully');
}

// Append string content to download file
export async function appendToDownloadFile(fileName: string, content: string): Promise<void> {
	const baseDir = BaseDirectory.AppData;

	log.debug('Appending string content to file:', {
		fileName,
		contentLength: content.length,
		baseDir: 'AppData',
	});

	await invoke('plugin:yellow|append_to_file', {
		fileName,
		data: btoa(content), // Convert string to base64
		baseDir,
	});

	log.debug('Content appended successfully');
}

// Rename a download file
export async function renameDownloadFile(oldName: string, newName: string): Promise<void> {
	const baseDir = BaseDirectory.AppData;

	log.debug('Renaming file:', {
		oldName,
		newName,
		baseDir: 'AppData',
	});

	await invoke('plugin:yellow|rename_file', {
		oldName,
		newName,
		baseDir,
	});

	log.debug('File renamed successfully');
}

// Delete a download file
export async function deleteDownloadFile(fileName: string): Promise<void> {
	log.debug('Deleting download file:', { fileName });
	await deleteFile(fileName);
}
