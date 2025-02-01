import { type FileDownload, type FileDownloadStoreType, type FileUploadChunk, type FileUploadRecord, FileUploadRecordStatus } from './types.ts';
import { assembleFile, makeFileDownload } from './utils.ts';
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
    download = makeFileDownload({record})
    this.downloadStore.set(record.id, download);
   }

   download.pullChunk = async () => {
    const retry = () => {
     setTimeout(() => {
      download.pullChunk && download.pullChunk();
     }, 1000);
    }
    const setRunning = (running: boolean) => {
     download.running = running;
     this.downloadStore.set(record.id, download);
    }

    if (download.canceledLocally) {
     this.downloadStore.delete(record.id);
     return;
    }
    if (
     // check for server pause status
     download.record.status === FileUploadRecordStatus.PAUSED ||
     // check for local pause flag
     download.pausedLocally
    ) {
     setRunning(false);
     retry();
     return;
    }
    if (download?.record.status === FileUploadRecordStatus.CANCELED) {
     setRunning(false);
     // todo clear memory
     return;
    }

    try {
     setRunning(true);
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
      setRunning(false);
      setTimeout(() => this.startNextDownload(download))
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
   fileDownloadStore.set(record.id, download);
   this.startDownload(download);
  }
 }

 async startDownload(download: FileDownload) {
  if (this.downloadStore.isAnyDownloadRunning()) {
   return;
  }
  download.pullChunk && download.pullChunk();
 }

 async startNextDownload(lastDownload: FileDownload) {
  if (this.downloadStore.isAnyDownloadRunning()) {
   return;
  }
  // we gonna find the next download by createdAt
  const downloads = this.downloadStore.getAll();
  const sortedDownloads = Object.values(downloads).sort((a, b) => a.createdAt - b.createdAt);
  let nextDownload = sortedDownloads.find(download => {
   return download.createdAt > lastDownload.createdAt && !download.pausedLocally && !download.canceledLocally;
  });

  if (nextDownload) {
   await this.startDownload(nextDownload);
  }
 }

 async pauseDownload(uploadId: string) {
  const download = this.downloadStore.get(uploadId);
  if (download) {
   download.pausedLocally = true;
   this.downloadStore.set(uploadId, download);
  }
 }

 async resumeDownload(uploadId: string) {
  const download = this.downloadStore.get(uploadId);
  if (download) {
   download.pausedLocally = false;
   this.downloadStore.set(uploadId, download);
  }
 }

 async cancelDownload(uploadId: string) {
  const download = this.downloadStore.get(uploadId);
  if (download) {
   download.canceledLocally = true;
   this.downloadStore.set(uploadId, download);
  }
 }
}

const fileDownloadManager = new FileDownloadManager(fileDownloadStore);
export default fileDownloadManager;
