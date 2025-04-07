import { get, writable } from 'svelte/store';
import type { FileDownload, FileDownloadStoreType, FileDownloadStoreValue, FileUploadRecord } from '../services/fileUpload/types.ts';

export class FileDownloadStore implements FileDownloadStoreType {
 store = writable<FileDownloadStoreValue>([]);

 getAll() {
  return get(this.store);
 }

 get(id: string) {
  return get(this.store).find(download => download.record.id === id);
 }

 set(id: string, download: FileDownload) {
  this.store.update(store => {
   const index = store.findIndex(d => d.record.id === id);
   if (index !== -1) {
    store[index] = download;
   } else {
    store.push(download);
   }
   return [...store];
  });
 }

 patch(id: string, data: Partial<FileDownload>) {
  // patch but dont change ref
  this.store.update(store => {
   const oldDownload = store.find(download => download.record.id === id);
   if (!oldDownload) {
    return store;
   }

   for (const key in data) {
    oldDownload[key] = data[key];
   }

   return [...store];
  });
 }

 delete(id: string) {
  this.store.update(store => store.filter(download => download.record.id !== id));
 }

 updateDownloadRecord(id: string, record: FileUploadRecord) {
  this.patch(id, { record });
 }

 isAnyDownloadRunning() {
  return this.getAll().some(download => download.running);
 }
}

const fileDownloadStore = new FileDownloadStore();
export default fileDownloadStore;
