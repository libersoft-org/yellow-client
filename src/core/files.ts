import { open, save } from '@tauri-apps/plugin-dialog';
import { rename, writeFile, open as openFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { get } from 'svelte/store';
import { isMobile } from './core.js';
import { log } from './tauri.ts';

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
  // On mobile, use app-specific directory instead of system Downloads
  this.baseDir = get(isMobile) ? BaseDirectory.AppData : BaseDirectory.Download;
 }
}

async function ensureFilePermissions(): Promise<{ success: boolean; error?: string }> {
 if (!get(isMobile)) {
  return { success: true }; // Desktop always has permissions
 }

 try {
  const permissions = await invoke<PermissionStatus>('plugin:yellow|check_permissions');
  if (permissions.writeExternalStorage !== 'granted' || permissions.readExternalStorage !== 'granted') {
   const result = await invoke<PermissionStatus>('plugin:yellow|request_permissions', {
    permissions: [PermissionType.WriteExternalStorage, PermissionType.ReadExternalStorage],
   });
   if (result.writeExternalStorage === 'granted' && result.readExternalStorage === 'granted') {
    return { success: true };
   } else {
    return { success: false, error: 'File permissions denied by user' };
   }
  }
  return { success: true };
 } catch (error) {
  log.debug('Failed to check/request file permissions:', error);
  return { success: false, error: 'Failed to check file permissions' };
 }
}

export async function offerNativeDownload(fileName: string, defaultFileDownloadFolder: string | null): Promise<NativeDownload | { error: string } | null> {
 // Ensure we have file permissions before proceeding
 const permissionResult = await ensureFilePermissions();
 if (!permissionResult.success) {
  return { error: permissionResult.error || 'File permissions not available' };
 }

 try {
  const download = new NativeDownload();
  download.original_file_name = fileName;

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

   log.debug('Save dialog returned path:', p);
   log.debug('isMobile:', get(isMobile));
   log.debug('baseDir:', download.baseDir);

   download.file_path = p;
   download.temp_file_path = partFileName(p);
   download.potential_default_folder = await path.dirname(p);

   try {
    await writeFile(download.temp_file_path, new Uint8Array(), { baseDir: download.baseDir });
   } catch (error) {
    log.debug('Failed to create temp file:', error);
    log.debug('Attempted path:', download.temp_file_path);
    log.debug('Base directory:', download.baseDir);
    return { error: `Failed to create temp file: ${error}` };
   }

   return download;
  }
 } catch (error) {
  log.debug('Error during file download offer:', error);
  return { error: `Failed to offer download: ${error}` };
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
   return;
  }
  counter++;
 }
}

function partFileName(file_path: string) {
 return file_path + '.part';
}
