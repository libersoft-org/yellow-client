import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { get, type Writable } from 'svelte/store';

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

async function generateTempFileName() {}

export async function writeChunk(handle: any, chunk: Uint8Array) {}

export async function finalize() {}
