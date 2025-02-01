import type { Writable } from 'svelte/store';

export enum FileUploadRole {
 ACTIVE_UPLOAD = 'ACTIVE_UPLOAD',
 SENDER = 'SENDER',
 RECEIVER = 'RECEIVER',
}

export enum FileUploadRecordType {
 P2P = 'P2P',
 SERVER = 'SERVER',
}

export enum FileUploadRecordStatus {
 BEGUN = 'BEGUN',
 UPLOADING = 'UPLOADING',
 FINISHED = 'FINISHED',
 CANCELED = 'CANCELED',
 PAUSED = 'PAUSED',
 ERROR = 'ERROR',
}

export interface FileUploadRecord {
 id: string;
 type: FileUploadRecordType;
 status: FileUploadRecordStatus;
 fileName: string;
 fileMimeType: string;
 fileSize: number;

 chunkSize: number;
}

export interface FileUpload {
 role: FileUploadRole;
 file: File | null;
 record: FileUploadRecord;
 chunksSent: number[];
 uploadInterval: NodeJS.Timeout | null;
 paused?: boolean;
 running?: boolean; // todo: maybe refactor to setTimeout (see upload.pushChunk)
 pushChunk?: () => Promise<void>;
 acc: any;
}

export interface FileDownload {
 record: FileUploadRecord;
 chunksReceived: any[];
 data: any;
 createdAt: number;
 running: boolean;
 pausedLocally?: boolean;
 canceledLocally?: boolean;
 pullChunk?: () => Promise<void>;
}

export interface FileUploadChunk {
 chunkId: number;
 uploadId: string;
 checksum: string;
 data: string; // base64
}

export interface FileUploadBeginOptions {
 chunkSize?: number;
}

export type MakeFileUploadRecordData = Partial<FileUploadRecord> & Pick<FileUploadRecord, 'type' | 'fileName' | 'fileMimeType' | 'fileSize' | 'chunkSize'>;

export type MakeFileUploadData = Partial<FileUpload> & Pick<FileUpload, 'role' | 'file' | 'record' | 'acc'>;

export type MakeFileDownloadData = Partial<FileDownload> & Pick<FileDownload, 'record'>;

export type FileUploadStoreValue = {
 [key: string]: FileUpload;
};

export type FileDownloadStoreValue = {
 [key: string]: FileDownload;
};

export type BaseStoreType<StoreValue, Item> = {
 store: Writable<StoreValue>;
 getAll: () => StoreValue;
 get: (id: string) => Item | undefined;
 set: (id: string, download: Item) => void;
 patch: (id: string, data: Partial<Item>) => void;
 delete: (id: string) => void;
};

export type FileUploadStoreType = BaseStoreType<FileUploadStoreValue, FileUpload>;
export type FileDownloadStoreType = {isAnyDownloadRunning: () => boolean;} & BaseStoreType<FileDownloadStoreValue, FileDownload>;
