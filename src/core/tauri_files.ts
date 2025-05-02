import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { get, type Writable } from 'svelte/store';
import { exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import { log } from '@/core/tauri.ts';

export async function initDownload(file_name: string, defaultFileDownloadFolder: Writable<string | null>) {
 let folder = get(defaultFileDownloadFolder);
 let offer_save_as_default_folder = false;
 if (!folder) {
  folder = await open({
   directory: true,
   multiple: false,
   title: 'Select download folder',
  });
  let offer_save_as_default_folder = true;
  if (!folder) {
   return { canceled: true };
  }
 }

 let temp_file_path = await generateTempFileName(file_name, folder);

 return {
  temp_file_path,
  offer_save_as_default_folder,
 };
}

async function generateTempFileName(file_name: string, folder: string) {
 log.debug('generateTempFileName', file_name, folder);
 let file_name2 = file_name;
 let file_path = `${folder}/${file_name2}`;
 let i = 1;
 while (true) {
  try {
   if (!(await exists(file_name, { baseDir: BaseDirectory.Download }))) {
    log.debug('File does not exist', file_path);
    break;
   }
  } catch (e) {
   file_name2 = `${file_name} (${i})`;
   file_path = `${folder}/${file_name2}`;
   i++;
  }
 }
 return file_path;
}

export async function writeChunk(handle: any, chunk: Uint8Array) {}

export async function finalize() {}
