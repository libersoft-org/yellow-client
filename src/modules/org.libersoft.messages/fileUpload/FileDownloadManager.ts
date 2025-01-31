import { type FileDownload, type FileDownloadStoreType, type FileUploadChunk, type FileUploadRecord, FileUploadRecordStatus } from './types.ts';
import { assembleFile } from './utils.ts';
import EventEmitter from 'events';
import fileDownloadStore from './fileDownloadStore.ts';

export class FileDownloadManager extends EventEmitter {
 downloadStore: FileDownloadStoreType;

 constructor(downloadStore: FileDownloadStoreType) {
  super();
  this.downloadStore = downloadStore;
 }

 async startDownloadSerial(
  records: FileUploadRecord[],
  pullChunkFn: (data: { uploadId: string; offsetBytes: number; chunkSize: number }) => Promise<{
   chunk: FileUploadChunk;
  }>
 ) {
  for (const record of records) {
   let download: FileDownload | undefined = this.downloadStore.get(record.id);

   if (!download) {
    download = {
     record,
     chunksReceived: [],
     data: null,
    };
    this.downloadStore.set(record.id, download);
   }

   download.pullChunk = async () => {
    const retry = () =>
     setTimeout(() => {
      download.pullChunk && download.pullChunk();
     }, 1000);

    if (download.canceledLocally) {
     this.downloadStore.delete(record.id);
     return;
    }

    if (
     // check for server pause status
     download?.record.status === FileUploadRecordStatus.PAUSED ||
     // check for local pause flag
     download?.paused
    ) {
     retry();
     return;
    }
    if (download?.record.status === FileUploadRecordStatus.CANCELED) {
     // todo clear memory
     return;
    }

    try {
     const chunkSize = record.chunkSize;
     const { chunk } = await pullChunkFn({
      uploadId: record.id,
      offsetBytes: download.chunksReceived.length * chunkSize,
      chunkSize: record.chunkSize,
     });

     // Decode Base64 chunk back to binary
     const binaryChunk = Uint8Array.from(atob(chunk.data), c => c.charCodeAt(0));
     download.chunksReceived[chunk.chunkId] = binaryChunk; // Store chunk in the correct order
     this.downloadStore.set(record.id, download);

     // Check if all chunks have been received
     if (download.chunksReceived.length * chunkSize >= record.fileSize) {
      assembleFile(download.chunksReceived, download.record.fileName);
      this.downloadStore.delete(record.id);
      // Clean up memory
      // download.chunksReceived = [];
     } else {
      download.pullChunk && (await download.pullChunk());
     }
    } catch (e) {
     // try again
     // todo: check for specific errors
     retry();
    }
   };
   await download.pullChunk();
  }
 }

 async pauseDownload(uploadId: string) {
  const download = this.downloadStore.get(uploadId);
  if (download) {
   download.paused = true;
   this.downloadStore.set(uploadId, download);
  }
 }

 async resumeDownload(uploadId: string) {
  const download = this.downloadStore.get(uploadId);
  if (download) {
   download.paused = false;
   this.downloadStore.set(uploadId, download);
  }
 }

 async cancelDownload(uploadId: string) {
  const download = this.downloadStore.get(uploadId);
  if (download) {
   download.canceledLocally = true;
  }
 }
}

const fileDownloadManager = new FileDownloadManager(fileDownloadStore);
export default fileDownloadManager;
