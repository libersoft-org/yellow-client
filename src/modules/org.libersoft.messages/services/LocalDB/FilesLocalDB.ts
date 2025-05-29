import Dexie from 'dexie';
//import type { FileUploadChunk } from '@/org.libersoft.messages/services/Files/types.ts';

export const FILES_DB_KEY = 'files';

export enum LocalFileStatus {
  INIT = 'INIT',
  DOWNLOADING = 'DOWNLOADING',
  READY = 'READY',
}

export interface LocalFile {
  id: number;
  localFileStatus: LocalFileStatus;
  fileTransferId: string;
  fileOriginalName: string;
  fileMimeType: string;
  fileSize: number;
  fileBlob?: Blob;
}

// export interface LocalFileChunk {
//  id: number;
//  fileTransferId: string;
//  chunkId: number;
//  checksum: string;
//  chunkOffset: number;
//  chunkSize: number;
//  data: Blob;
// }

export class FilesLocalDB extends Dexie {
  files!: Dexie.Table<LocalFile, number>;
  // filesChunks!: Dexie.Table<LocalFileChunk, number>;

  constructor() {
    super(FILES_DB_KEY);
    this.version(1).stores({
      files: 'fileTransferId, internalStatus, fileOriginalName, fileMimeType, fileSize',
      // filesChunks: 'id++, fileTransferId, chunkOffset, chunkSize, chunkId, checksum'
    });
  }

  async addFile(file: Omit<LocalFile, 'id'>) {
    console.log('AAA adding file');
    return this.files.add(file as LocalFile);
  }

  async findFile(fileTransferId: string) {
    return this.files.where({ fileTransferId }).first();
  }

  async updateFile(fileTransferId: string, update: Partial<LocalFile>) {
    // const f = await this.files.where({ fileTransferId }).first();
    return await this.files.where({ fileTransferId }).modify(update);
  }

  // async addChunksToFile(fileTransferId: string, chunks: Omit<LocalFileChunk, 'id'>[]) {
  //  const file = await this.findFile(fileTransferId);
  //  if (!file) {
  //   throw new Error('File not found');
  //  }
  //  await this.filesChunks.bulkAdd(chunks as LocalFileChunk[]);
  // }
}

const filesDB = new FilesLocalDB();
export default filesDB;
