import { get, writable } from 'svelte/store';
import type { FileUpload, FileUploadRecord, FileUploadStoreType, FileUploadStoreValue } from './types.ts';

export class FileUploadStore implements FileUploadStoreType {
 store = writable<FileUploadStoreValue>([]);

 getAll() {
  return get(this.store);
 }

 get(id: string) {
  return get(this.store).find(upload => upload.record.id === id);
 }

 set(id: string, upload: FileUpload) {
  this.store.update(store => {
   const index = store.findIndex(d => d.record.id === id);
   if (index !== -1) {
    store[index] = upload;
   } else {
    store.push(upload);
   }
   return [...store];
  });
 }

 patch(id: string, data: Partial<FileUpload>) {
  this.store.update(store => {
   return store.map(upload => (upload.record.id === id ? { ...upload, ...data } : upload));
  });
 }

 delete(id: string) {
  this.store.update(store => store.filter(upload => upload.record.id !== id));
 }

 updateUploadRecord(id: string, record: FileUploadRecord) {
  this.patch(id, { record });
 }

 isAnyUploadRunning() {
  return this.getAll().some(upload => upload.running);
 }
}

const fileUploadStore = new FileUploadStore();
export default fileUploadStore;
