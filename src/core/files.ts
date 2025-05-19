import { open, save } from '@tauri-apps/plugin-dialog';
import { rename, writeFile, open as openFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';

export class NativeDownload {
 public original_file_name: string;
 public file_path: string;
 public temp_file_path: string;
 public potential_default_folder: null | string = null;
 public finished: boolean = false;

 constructor() {
  this.original_file_name = '';
  this.file_path = '';
  this.temp_file_path = '';
 }
}

export async function offerNativeDownload(file_name: string, defaultFileDownloadFolder: string | null) {
 const download = new NativeDownload();
 download.original_file_name = file_name;

 if (defaultFileDownloadFolder) {
  await findFreeFileName(defaultFileDownloadFolder, download);
  return download;
 } else {
  let p = await save({
   defaultPath: defaultFileDownloadFolder ? await path.join(defaultFileDownloadFolder, file_name) : file_name,
   canCreateDirectories: true,
   title: 'Save file',
  });
  if (!p) {
   return null;
  }
  download.file_path = p;
  download.temp_file_path = partFileName(p);
  download.potential_default_folder = await path.dirname(p);
  await writeFile(download.temp_file_path, new Uint8Array(), { baseDir: BaseDirectory.Download });
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
  baseDir: BaseDirectory.Download,
 });
 await file.write(new Uint8Array(await chunk.arrayBuffer()));
 await file.close();
}

export async function finishNativeDownload(download: NativeDownload) {
 const file_path = download.file_path;
 const temp_file_path = download.temp_file_path;
 download.finished = true;
 await rename(temp_file_path, file_path, {
  oldPathBaseDir: BaseDirectory.Download,
  newPathBaseDir: BaseDirectory.Download,
 });
}

async function findFreeFileName(folder: string, download: NativeDownload) {
 let counter = 0;
 while (true) {
  let file_name = download.original_file_name + (counter > 0 ? ` (${counter})` : '');
  const file_path = await path.join(folder, file_name);
  const exists_file = await exists(file_path, { baseDir: BaseDirectory.Download });
  const temp_file_path = partFileName(file_path);
  const exists_file2 = await exists(temp_file_path, { baseDir: BaseDirectory.Download });
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
