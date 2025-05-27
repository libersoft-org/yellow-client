import { open, save } from '@tauri-apps/plugin-dialog';
import { rename, writeFile, open as openFile, exists, BaseDirectory, readFile, mkdir, remove } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { TAURI_MOBILE, log } from './tauri.ts';

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
  log.debug('Attempting to invoke plugin:yellow|check_file_permissions');
  const permissions = await invoke<PermissionStatus>('plugin:yellow|check_file_permissions');
  log.debug('check_file_permissions result:', permissions);
  if (permissions.writeExternalStorage !== 'granted' || permissions.readExternalStorage !== 'granted') {
   log.debug('Permissions not granted, requesting...');
   const result = await invoke<PermissionStatus>('plugin:yellow|request_file_permissions', {
    permissions: [PermissionType.WriteExternalStorage, PermissionType.ReadExternalStorage]
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
  return { success: false, error: `Failed to check file permissions: ${error instanceof Error ? error.message : String(error)}` };
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

 // On mobile, always use app-specific directory without save dialog
 if (TAURI_MOBILE) {
  download.baseDir = BaseDirectory.AppData;
  
  try {
   // For mobile, save directly to app's data directory without subdirectory for now
   // This avoids path resolution issues
   download.file_path = fileName;
   download.temp_file_path = fileName + '.part';  // Avoid function call that might cause issues
   download.potential_default_folder = null;
   
   log.debug('Mobile download paths:', {
    file_path: download.file_path,
    temp_file_path: download.temp_file_path,
    baseDir: download.baseDir,
    baseDirName: 'AppData'
   });
   
   // Try with a very simple approach first
   log.debug('About to call writeFile with:', {
    path: download.temp_file_path,
    baseDir: download.baseDir
   });
   
   // Create the temp file in app's local directory
   await writeFile(download.temp_file_path, new Uint8Array(), { baseDir: download.baseDir });
  } catch (error) {
   log.debug('Failed to create temp file:', error);
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
 
 log.debug('finishNativeDownload - paths:', {
  file_path,
  temp_file_path,
  baseDir: download.baseDir,
  TAURI_MOBILE
 });
 
 if (TAURI_MOBILE) {
  // On mobile, use read/write instead of rename to avoid path issues
  try {
   const fileData = await readFile(temp_file_path, { baseDir: download.baseDir });
   await writeFile(file_path, fileData, { baseDir: download.baseDir });
   // Delete the temp file
   await remove(temp_file_path, { baseDir: download.baseDir });
  } catch (error) {
   log.debug('Mobile file finalization error:', error);
   throw error;
  }
 } else {
  // Desktop can use rename
  await rename(temp_file_path, file_path, {
   oldPathBaseDir: download.baseDir,
   newPathBaseDir: download.baseDir,
  });
 }
 
 // On mobile, offer to export the file to the system Downloads folder
 if (TAURI_MOBILE) {
  log.debug('File saved to app storage:', file_path);
  log.debug('To export to system Downloads, call exportToSystemDownloads with:', {
   appFilePath: file_path,
   fileName: download.original_file_name
  });
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
    log.debug('Failed to create temp file in findFreeFileName:', error);
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
  const fileData = await readFile(appFilePath, { baseDir: BaseDirectory.AppData });
  
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
  log.debug('Failed to export to Downloads:', error);
  return { success: false, error: error instanceof Error ? error.message : String(error) };
 }
}
