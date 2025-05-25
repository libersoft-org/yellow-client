import { open, save } from '@tauri-apps/plugin-dialog';
import { rename, writeFile, open as openFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { get } from 'svelte/store';
import { isMobile } from './core.js';

interface CheckPermissionsResponse {
 writeExternalStorage: string;
}

interface RequestPermissionsResponse {
 writeExternalStorage: string;
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
  this.baseDir = get(isMobile) ? BaseDirectory.AppLocalData : BaseDirectory.Download;
 }
}

async function ensureFilePermissions(): Promise<{ success: boolean; error?: string }> {
 if (!get(isMobile)) {
  return { success: true }; // Desktop always has permissions
 }

 try {
  const permissions = await invoke<CheckPermissionsResponse>('plugin:yellow|check_file_permissions');
  if (permissions.writeExternalStorage !== 'granted') {
   const result = await invoke<RequestPermissionsResponse>('plugin:yellow|request_file_permissions');
   if (result.writeExternalStorage === 'granted') {
    return { success: true };
   } else {
    return { success: false, error: 'File permissions denied by user' };
   }
  }
  return { success: true };
 } catch (error) {
  console.error('Failed to check/request file permissions:', error);
  return { success: false, error: 'Failed to check file permissions' };
 }
}

export async function offerNativeDownload(fileName: string, defaultFileDownloadFolder: string | null): Promise<NativeDownload | { error: string } | null> {
 // Ensure we have file permissions before proceeding
 const permissionResult = await ensureFilePermissions();
 if (!permissionResult.success) {
  return { error: permissionResult.error || 'File permissions not available' };
 }

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
