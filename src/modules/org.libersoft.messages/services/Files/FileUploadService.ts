import { type CustomFile, type FileUpload, type FileUploadBeginOptions, type FileUploadRecord, FileUploadRecordStatus, FileUploadRecordType, FileUploadRole, type FileUploadStoreType } from './types.ts';
import { blobToBase64, makeFileUpload, makeFileUploadRecord } from './utils.ts';
import EventEmitter from 'events';
import fileUploadStore from '../../stores/FileUploadStore.ts';

export class FileUploadService extends EventEmitter {
 uploadsStore: FileUploadStoreType;

 p2pThrottleMemory = new Map();
 p2pMaxBatchChunks = 10;

 constructor(uploadsStore: FileUploadStoreType) {
  super();

  this.uploadsStore = uploadsStore;
 }

 beginUpload(files: FileList, type: FileUploadRecordType, acc, options: FileUploadBeginOptions) {
  const uploads: FileUpload[] = [];
  for (let i = 0; i < files.length; i++) {
   const file = files[i] as CustomFile;
   const record = makeFileUploadRecord({
    type,
    fileOriginalName: file.name,
    fileMimeType: file.type,
    fileSize: file.size,
    chunkSize: options?.chunkSize || 1024 * 64,
    fromUserUid: acc.id,
    metadata: file.metadata,
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
    const setRunning = (running: boolean) => {
     upload.running = running;
     this.uploadsStore.set(record.id, upload);
    };

    setRunning(true);
    if (upload.record.status === FileUploadRecordStatus.CANCELED || upload.record.status === FileUploadRecordStatus.ERROR) {
     setRunning(false);
     upload.pushChunk = undefined;
     return;
    }
    if (upload.record.status === FileUploadRecordStatus.PAUSED) {
     setRunning(false);
     return;
    }
    if (chunksSent.length === Math.ceil(record.fileSize / chunkSize)) {
     upload.record.status = FileUploadRecordStatus.FINISHED;
     this.uploadsStore.set(record.id, upload);
     setRunning(false);
     setTimeout(() => this.startNextUpload(upload));
     return;
    }
    if (record.type === FileUploadRecordType.P2P && this.p2pThrottleMemory.get(record.id) >= this.p2pMaxBatchChunks) {
     setRunning(false);
     return;
    }

    const lastChunkId = chunksSent[chunksSent.length - 1];
    const newChunkId = lastChunkId === undefined ? 0 : lastChunkId + 1;
    const { chunk, blob } = await this.getChunk(upload.record.id, newChunkId, chunkSize);

    await pushFn({ chunk, upload });
    chunksSent[newChunkId] = newChunkId;
    this.uploadsStore.set(record.id, upload);

    if (record.type === FileUploadRecordType.P2P) {
     const throttleMemory = this.p2pThrottleMemory.get(record.id) || 0;
     this.p2pThrottleMemory.set(record.id, throttleMemory + 1);
    }

    upload.pushChunk && (await upload.pushChunk());
   };
   this.uploadsStore.set(record.id, upload);
   this.startUpload(upload);
  }
 }

 async startUpload(upload: FileUpload) {
  console.log('this.uploadsStore.isAnyUploadRunning()', this.uploadsStore.isAnyUploadRunning());
  if (this.uploadsStore.isAnyUploadRunning()) {
   return;
  }
  upload.pushChunk && (await upload.pushChunk());
 }

 async startNextUpload(lastUpload: FileUpload) {
  const uploads = this.uploadsStore.getAll();
  const lastUploadIndex = uploads.findIndex(upload => upload.record.id === lastUpload.record.id);
  let nextUpload: FileUpload | undefined;

  // find next suitable upload
  for (let i = lastUploadIndex + 1; i < uploads.length; i++) {
   const upload = uploads[i];
   if (upload.record.type === FileUploadRecordType.SERVER && upload.record.status === FileUploadRecordStatus.BEGUN) {
    nextUpload = upload;
    break;
   }
  }

  if (nextUpload) {
   await this.startUpload(nextUpload);
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
  upload.pushChunk && !upload.running && (await upload.pushChunk());
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

const fileUploadManager = new FileUploadService(fileUploadStore);
export default fileUploadManager;
