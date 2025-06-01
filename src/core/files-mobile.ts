import { invoke } from '@tauri-apps/api/core';
import { TAURI_MOBILE, log } from './tauri.ts';

export interface MobileDownload {
	fileName: string;
	tempFileName: string;
	finished: boolean;
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

	// Find a free filename to avoid conflicts
	const result = await findFreeFileName(fileName);
	if ('error' in result) {
		log.debug('Error finding free filename:', result.error);
		return result;
	}

	const { fileName: finalFileName } = result;
	const tempFileName = `${finalFileName}.part`;

	log.debug('Found free filename, creating temp file:', {
		finalFileName,
		tempFileName,
	});

	try {
		// Create empty file
		await invoke('plugin:yellow|create_file', {
			fileName: tempFileName,
			content: '',
		});

		log.debug('Successfully created temp file');
		return {
			fileName: finalFileName,
			tempFileName,
			finished: false,
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
	log.debug('Checking if file exists:', { fileName });

	try {
		const result = await invoke('plugin:yellow|file_exists', {
			fileName,
		});

		const exists = !!result;
		log.debug('File existence check result:', {
			fileName,
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

	await invoke('plugin:yellow|append_to_file', {
		fileName: download.tempFileName,
		data: base64Data,
	});
}

// Finish download by renaming temp file
export async function finishDownload(download: MobileDownload): Promise<void> {
	if (download.finished) {
		throw new Error('Download already finished');
	}

	await invoke('plugin:yellow|rename_file', {
		oldName: download.tempFileName,
		newName: download.fileName,
	});

	download.finished = true;
}

// Export file with save dialog
export async function exportFileWithDialog(fileName: string, mimeType: string = 'application/octet-stream'): Promise<{ success: boolean; error?: string }> {
	if (!TAURI_MOBILE) {
		return { success: false, error: 'This function is only for mobile platforms' };
	}

	try {
		// Open save dialog
		const dialogResult = (await invoke('plugin:yellow|open_save_dialog', {
			fileName,
			mimeType,
		})) as { success: boolean; uri?: string; fileName?: string; mimeType?: string };

		if (!dialogResult.success || !dialogResult.uri) {
			return { success: false, error: 'Save dialog cancelled' };
		}

		// Save the file to the selected URI
		await invoke('plugin:yellow|save_file_to_uri', {
			filePath: fileName,
			uri: dialogResult.uri,
		});

		log.debug('File exported successfully to:', dialogResult.uri);
		return { success: true };
	} catch (error) {
		log.debug('Failed to export file:', error);
		return { success: false, error: error instanceof Error ? error.message : String(error) };
	}
}

// Delete a file
export async function deleteFile(fileName: string): Promise<void> {
	await invoke('plugin:yellow|delete_file', {
		fileName,
	});
}

// Append string content to download file
export async function appendToDownloadFile(fileName: string, content: string): Promise<void> {
	await invoke('plugin:yellow|append_to_file', {
		fileName,
		data: btoa(content), // Convert string to base64
	});
}

// Rename a download file
export async function renameDownloadFile(oldName: string, newName: string): Promise<void> {
	await invoke('plugin:yellow|rename_file', {
		oldName,
		newName,
	});
}

// Delete a download file
export async function deleteDownloadFile(fileName: string): Promise<void> {
	await deleteFile(fileName);
}
