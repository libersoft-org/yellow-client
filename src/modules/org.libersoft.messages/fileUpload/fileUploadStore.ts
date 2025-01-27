import { writable } from 'svelte/store';
import type { FileUpload, FileUploadStoreType, FileUploadStoreValue } from './types.ts';

export class FileUploadStore implements FileUploadStoreType {
 store = writable<FileUploadStoreValue>({});

 get(id: string) {
  let upload: FileUpload | undefined;
  this.store.subscribe(store => {
   upload = store[id];
  });
  return upload;
 }

 set(id: string, upload: FileUpload) {
  this.store.update(store => {
   store[id] = upload;
   return { ...store };
  });
 }

 patch(id: string, data: Partial<FileUpload>) {
  this.store.update(store => {
   store[id] = { ...store[id], ...data };
   return { ...store };
  });
 }

 delete(id: string) {
  this.store.update(store => {
   delete store[id];
   return { ...store };
  });
 }
}

const fileUploadStore = new FileUploadStore();
export default fileUploadStore;
