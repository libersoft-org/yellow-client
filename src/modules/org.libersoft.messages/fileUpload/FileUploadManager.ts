import { type FileUpload, type FileUploadRecord, FileUploadRecordStatus, FileUploadRecordType, FileUploadRole, type FileUploadStoreType } from './types.ts';
import { blobToBase64, makeFileUpload, makeFileUploadRecord } from './utils.ts';
import EventEmitter from 'events';
import fileUploadStore from './fileUploadStore.ts';

class FileUploadManager extends EventEmitter {
 uploadsStore: FileUploadStoreType;

 p2pThrottleMemory = new Map();
 p2pMaxBatchChunks = 10;

 constructor(uploadsStore: FileUploadStoreType) {
  super();

  this.uploadsStore = uploadsStore;
 }

 beginUpload(files: FileList, type: FileUploadRecordType, acc) {
  const uploads: FileUpload[] = [];
  for (let i = 0; i < files.length; i++) {
   const file = files[i];
   const record = makeFileUploadRecord({
    type,
    fileName: file.name,
    fileMimeType: file.type,
    fileSize: file.size,
    chunkSize: 1024 * 64, // todo: default/conf value
   });
   const upload = makeFileUpload({
    role: FileUploadRole.SENDER,
    file,
    record,
    acc,
   });
   this.uploadsStore.set(upload.record.id, upload);
   uploads.push(upload);
  }

  return { uploads };
 }

 async getChunk(uploadId: string, chunkId: number, chunkSize: number) {
  const upload = this.uploadsStore.get(uploadId);

  if (!upload) {
   throw new Error('Upload not found');
  }
  if (!upload.file) {
   throw new Error('File is not set in file transfer');
  }

  const blob = upload.file.slice(chunkId * chunkSize, chunkId * chunkSize + chunkSize);

  const chunk = {
   chunkId,
   uploadId,
   checksum: '',
   data: await blobToBase64(blob),
  };

  return { chunk, upload, blob };
 }

 async startUploadSerial(records: FileUploadRecord[], pushFn: (data: { chunk: any; upload: FileUpload }) => Promise<void>) {
  for (let i = 0; i < records.length; i++) {
   const record = records[i];
   const upload = this.uploadsStore.get(record.id);

   if (!upload) {
    continue;
   }
   if (!upload.file) {
    continue;
   }

   const { chunksSent } = upload;
   const { chunkSize } = upload.record;

   upload.pushChunk = async () => {
    if (upload.record.status === FileUploadRecordStatus.CANCELED) {
     upload.pushChunk = undefined;
     return;
    }
    if (upload.record.status === FileUploadRecordStatus.PAUSED) {
     return;
    }
    if (chunksSent.length === Math.ceil(record.fileSize / chunkSize)) {
     return;
    }
    if (record.type === FileUploadRecordType.P2P && this.p2pThrottleMemory.get(record.id) >= this.p2pMaxBatchChunks) {
     return;
    }

    const lastChunkId = chunksSent[chunksSent.length - 1];
    const newChunkId = lastChunkId === undefined ? 0 : lastChunkId + 1;
    const { chunk, blob } = await this.getChunk(upload.record.id, newChunkId, chunkSize);

    await pushFn({ chunk, upload });
    chunksSent.push(newChunkId);
    this.uploadsStore.set(record.id, upload);

    if (record.type === FileUploadRecordType.P2P) {
     const throttleMemory = this.p2pThrottleMemory.get(record.id) || 0;
     this.p2pThrottleMemory.set(record.id, throttleMemory + 1);
    }

    upload.pushChunk && (await upload.pushChunk());
   };
   await upload.pushChunk();
  }
 }

 async continueP2PUpload(uploadId: string) {
  // proceed to next batch
  const upload = this.uploadsStore.get(uploadId);
  if (!upload) {
   return;
  }
  if (!upload.file) {
   return;
  }
  // reset throttle memory
  this.p2pThrottleMemory.set(uploadId, 0);
  upload.pushChunk && (await upload.pushChunk());
 }

 pauseUpload(uploadId: string) {
  const upload = this.uploadsStore.get(uploadId);

  if (!upload) {
   return;
  }

  upload.record.status = FileUploadRecordStatus.PAUSED;
  this.uploadsStore.set(uploadId, upload);
 }

 resumeUpload(uploadId: string) {
  const upload = this.uploadsStore.get(uploadId);

  if (!upload) {
   return;
  }

  upload.record.status = FileUploadRecordStatus.UPLOADING;
  this.uploadsStore.set(uploadId, upload);
  upload.pushChunk && upload.pushChunk();
 }

 cancelUpload(uploadId: string) {
  const upload = this.uploadsStore.get(uploadId);

  if (!upload) {
   return;
  }

  upload.record.status = FileUploadRecordStatus.CANCELED;
  this.uploadsStore.set(uploadId, upload);
 }
}

const fileUploadManager = new FileUploadManager(fileUploadStore);
export default fileUploadManager;
