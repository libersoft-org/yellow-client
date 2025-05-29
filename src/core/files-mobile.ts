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

	const tempFileName = `${fileName}.part`;

	try {
		// Create empty file
		await invoke('plugin:yellow|create_file', {
			fileName: tempFileName,
			content: '',
		});

		return {
			fileName,
			tempFileName,
			finished: false,
		};
	} catch (error) {
		log.debug('Failed to create download file:', error);
		return { error: `Failed to create file: ${error}` };
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
