import { get, writable } from 'svelte/store';
import type { FileDownload, FileDownloadStoreType, FileDownloadStoreValue, FileUploadRecord } from './types.ts';

export class FileDownloadStore implements FileDownloadStoreType {
 store = writable<FileDownloadStoreValue>({});

 getAll() {
  return get(this.store);
 }

 get(id: string) {
  return get(this.store)[id];
 }

 set(id: string, download: FileDownload) {
  this.store.update(store => {
   store[id] = download;
   return { ...store };
  });
 }

 patch(id: string, data: Partial<FileDownload>) {
  this.store.update(store => {
   store[id] = { ...store[id], ...data };
   return { ...store };
  });
 }

 delete(id: string) {
  this.store.update(store => {
   const newStore = { ...store };
   delete newStore[id];
   return newStore;
  });
 }

 updateDownloadRecord(id: string, record: FileUploadRecord) {
  const download = this.get(id);
  if (download) {
   download.record = record;
   this.patch(id, { record });
  }
 }

 isAnyDownloadRunning() {
  const downloads = this.getAll();
  for (const id in downloads) {
   if (downloads[id].running) {
    return true;
   }
  }
  return false;
 }
}

const fileDownloadStore = new FileDownloadStore();
export default fileDownloadStore;
