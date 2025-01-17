import { writable } from "svelte/store";
import type { FileUploadRecord } from './types.ts'
import type { FileDownload, FileUpload } from './FileUploadManager.ts'

export const uploads = writable<FileUpload[]>([]);

export const downloads = writable<FileDownload[]>([]);

const fileUploadStore = {
 uploads: {
  ...uploads,
  add: (newUploads: FileUpload[]) => {
   uploads.update(existingUploads => [...existingUploads, ...newUploads]);
  },
  // fixme: dont overwrite svelte's update
  update: (id: string, upload: FileUpload) => {
   uploads.update(uploads => {
    console.log('III ', uploads)
    const index = uploads.findIndex(upload => {
     console.log('III 2', upload)
     return upload.record.id === id
    });
    console.log('BBB index', index)
    if (index === -1) {
     return uploads;
    }

    uploads[index] = upload;
    console.log('BBB uploads', uploads)
    return uploads;
   });
  }
 },
 downloads: {
  ...downloads,
  add: (newDownloads: FileDownload[]) => {
   downloads.update(existingDownloads => {

    console.log('hudry hudry', [...existingDownloads, ...newDownloads])
    return [...existingDownloads, ...newDownloads]
   });
  },
  // fixme: dont overwrite svelte's update
  update: (id: string, download: FileDownload) => {
   downloads.update(downloads => {
    const index = downloads.findIndex(download => download.record.id === id);
    if (index === -1) {
     return downloads;
    }

    downloads[index] = download;
    return downloads;
   });
  }
 }
};

export default fileUploadStore
