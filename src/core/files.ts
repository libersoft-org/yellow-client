import { open, save } from '@tauri-apps/plugin-dialog';
import { rename, writeFile, open as openFile, exists, BaseDirectory, readFile } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { TAURI_MOBILE } from './tauri.ts';

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
  console.log('Attempting to invoke plugin:yellow|check_file_permissions');
  const permissions = await invoke<PermissionStatus>('plugin:yellow|check_file_permissions');
  console.log('check_file_permissions result:', permissions);
  if (permissions.writeExternalStorage !== 'granted' || permissions.readExternalStorage !== 'granted') {
   console.log('Permissions not granted, requesting...');
   const result = await invoke<PermissionStatus>('plugin:yellow|request_file_permissions', {
    permissions: [PermissionType.WriteExternalStorage, PermissionType.ReadExternalStorage]
   });
   console.log('request_file_permissions result:', result);
   if (result.writeExternalStorage === 'granted' && result.readExternalStorage === 'granted') {
    return { success: true };
   } else {
    return { success: false, error: 'File permissions denied by user' };
   }
  }
  return { success: true };
 } catch (error) {
  console.error('Failed to check/request file permissions:', error);
  console.error('Error details:', JSON.stringify(error, null, 2));
  return { success: false, error: `Failed to check file permissions: ${error instanceof Error ? error.message : String(error)}` };
 }
}

export async function offerNativeDownload(fileName: string, defaultFileDownloadFolder: string | null): Promise<NativeDownload | { error: string } | null> {
 console.log('offerNativeDownload - TAURI_MOBILE:', TAURI_MOBILE);
 
 // Ensure we have file permissions before proceeding
 const permissionResult = await ensureFilePermissions();
 if (!permissionResult.success) {
  return { error: permissionResult.error || 'File permissions not available' };
 }

 const download = new NativeDownload();
 download.original_file_name = fileName;

 // On mobile, always use app-specific directory without save dialog
 if (TAURI_MOBILE) {
  download.baseDir = BaseDirectory.AppLocalData;
  // For mobile, create a Downloads folder in app's local data
  const appDownloadsPath = await path.join('Downloads', fileName);
  download.file_path = appDownloadsPath;
  download.temp_file_path = partFileName(appDownloadsPath);
  download.potential_default_folder = 'Downloads';
  
  try {
   // Create the temp file in app's local directory
   await writeFile(download.temp_file_path, new Uint8Array(), { baseDir: download.baseDir });
  } catch (error) {
   console.error('Failed to create temp file:', error);
   return { error: 'Failed to create temp file: ' + error };
  }
  return download;
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
 const file_path = download.temp_file_path;

 //await writeFile(download.temp_file_path, new Uint8Array(await chunk.arrayBuffer()), {baseDir: BaseDirectory.Download});

 const file = await openFile(file_path, {
  append: true,
  baseDir: download.baseDir,
 });
 await file.write(new Uint8Array(await chunk.arrayBuffer()));
 await file.close();
}

export async function finishNativeDownload(download: NativeDownload) {
 const file_path = download.file_path;
 const temp_file_path = download.temp_file_path;
 download.finished = true;
 await rename(temp_file_path, file_path, {
  oldPathBaseDir: download.baseDir,
  newPathBaseDir: download.baseDir,
 });
 
 // On mobile, offer to export the file to the system Downloads folder
 if (TAURI_MOBILE) {
  try {
   // TODO: You might want to show a notification or dialog here
   // offering the user to move the file to their Downloads folder
   console.log('File saved to app storage:', file_path);
  } catch (error) {
   console.error('Post-download handling error:', error);
  }
 }
}

async function findFreeFileName(folder: string, download: NativeDownload) {
 let counter = 0;
 while (true) {
  let file_name = download.original_file_name + (counter > 0 ? ` (${counter})` : '');
  const file_path = await path.join(folder, file_name);
  const exists_file = await exists(file_path, { baseDir: download.baseDir });
  const temp_file_path = partFileName(file_path);
  const exists_file2 = await exists(temp_file_path, { baseDir: download.baseDir });
  if (!exists_file && !exists_file2) {
   download.file_path = file_path;
   download.temp_file_path = temp_file_path;
   try {
    // Create the temp file
    await writeFile(download.temp_file_path, new Uint8Array(), { baseDir: download.baseDir });
   } catch (error) {
    console.error('Failed to create temp file in findFreeFileName:', error);
    throw error;
   }
   return;
  }
  counter++;
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
  // Read the file from app storage
  const fileData = await readFile(appFilePath, { baseDir: BaseDirectory.AppLocalData });
  
  // Convert to base64
  const base64Data = btoa(String.fromCharCode(...fileData));
  
  // Use our plugin to save to Downloads
  const result = await invoke('plugin:yellow|save_to_downloads', {
   fileName: fileName,
   mimeType: mimeType,
   data: base64Data
  });
  
  return { success: true };
 } catch (error) {
  console.error('Failed to export to Downloads:', error);
  return { success: false, error: error instanceof Error ? error.message : String(error) };
 }
}
