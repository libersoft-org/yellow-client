import { get } from 'svelte/store';
import { active_account } from '../../../core/core';
import filesDB, { type LocalFile, LocalFileStatus } from '../localDB/files.localDB.ts';
import { loadUploadData, makeDownloadChunkAsyncFn } from '../messages';
import fileUploadManager, { type FileUploadManager } from './FileUploadManager.ts';
import fileDownloadManager, { type FileDownloadManager } from './FileDownloadManager.ts';
import { liveQuery } from 'dexie';

export class FilesService {
 fileUploadManager: FileUploadManager;
 fileDownloadManager: FileDownloadManager;

 constructor(fileUploadManager: FileUploadManager, fileDownloadManager: FileDownloadManager) {
  this.fileUploadManager = fileUploadManager;
  this.fileDownloadManager = fileDownloadManager;
 }

 getOrDownloadAttachment(uploadId: string): Promise<{ localFile: LocalFile }> {
  return new Promise(async (resolve, reject) => {
   const acc = get(active_account);

   // check indexedDB if file is already downloaded (or being downloaded)
   const localFile = await filesDB.findFile(uploadId);

   if (localFile) {
    if (localFile.localFileStatus === LocalFileStatus.READY) {
     resolve({ localFile });
     return;
    }
    // try to find download for this uploadId
    const existingDownload = this.fileDownloadManager.downloadStore.get(uploadId);
    if (existingDownload) {
     // download is in progress
     const obs = liveQuery(() => filesDB.files.where({ fileTransferId: uploadId }).first());
     const sub = obs.subscribe(subscribedLocalFile => {
      if (subscribedLocalFile?.localFileStatus === LocalFileStatus.READY) {
       sub.unsubscribe();
       resolve({ localFile });
      }
     });
     return;
    } else {
     // if reached here, file will probably never be downloaded so we gonna delete it
     await filesDB.files.delete(localFile.id);
    }
   }

   // first fetch file record data
   const { record } = await loadUploadData(uploadId);

   const newLocalFile: Omit<LocalFile, 'id'> = {
    localFileStatus: LocalFileStatus.DOWNLOADING,
    fileTransferId: record.id,
    fileOriginalName: record.fileOriginalName,
    fileMimeType: record.fileMimeType,
    fileSize: record.fileSize,
   };

   await filesDB.addFile(newLocalFile);

   this.fileDownloadManager.startDownloadSerial([record], makeDownloadChunkAsyncFn(acc), async download => {
    newLocalFile.localFileStatus = LocalFileStatus.READY;
    newLocalFile.fileBlob = new Blob(download.chunksReceived, { type: record.fileMimeType });
    const result = await filesDB.updateFile(record.id, newLocalFile);
    resolve({ localFile: newLocalFile as LocalFile });
   });
  });
 }
}

const filesService = new FilesService(fileUploadManager, fileDownloadManager);
export default filesService;
