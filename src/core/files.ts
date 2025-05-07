import { open } from '@tauri-apps/plugin-dialog';
import { rename, writeFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';

const path = require('node:path');

export class NativeDownload {
 public original_file_name: string;
 public file_path: string;
 public temp_file_path: string;
 public potential_default_folder: null | string = null;
}

async function findFreeFileName(folder: string, download: NativeDownload) {
 let counter = 0;
 while (true) {
  let file_name = download.original_file_name + (counter > 0 ? ` (${counter})` : '');
  const file_path = path.join(folder, file_name);
  const exists_file = await exists(file_path, { dir: BaseDirectory.Download });
  const temp_file_path = path.join(file_path, '.part');
  const exists_file2 = await exists(temp_file_path, { dir: BaseDirectory.Download });
  if (!exists_file && !exists_file2) {
   download.file_path = file_path;
   download.temp_file_path = temp_file_path;
  }
  counter++;
 }
}

export async function offerNativeDownload(file_name: string, defaultFileDownloadFolder: string) {
 const download = new NativeDownload();
 download.original_file_name = file_name;

 if (defaultFileDownloadFolder) {
  await findFreeFileName(defaultFileDownloadFolder, download);
  return download;
 } else {
  let p = await open({
   multiple: false,
   title: 'Save file',
  });
  if (!p) {
   return null;
  }
  download.file_path = p;
  download.temp_file_path = path.join(p, '.part');
  download.potential_default_folder = path.dirname(p);
  return download;
 }
}

export async function saveNativeDownloadChunk(download: NativeDownload, chunk: Blob) {
 const file_path = download.file_path;
 await writeFile(download.temp_file_path, chunk, { dir: BaseDirectory.Download });
}

export async function finishNativeDownload(download: NativeDownload) {
 const file_path = download.file_path;
 const temp_file_path = download.temp_file_path;
 await rename(temp_file_path, file_path, { dir: BaseDirectory.Download });
}
