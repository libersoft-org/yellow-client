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

export enum FileUploadRecordErrorType {
 TIMEOUT_BY_SERVER = 'TIMEOUT_BY_SERVER',
}

export interface FileUploadRecord {
 id: string;
 type: FileUploadRecordType;
 status: FileUploadRecordStatus;
 errorType: FileUploadRecordErrorType | null;
 fileOriginalName: string;
 fromUserUid: string;
 fileMimeType: string;
 fileSize: number;

 chunkSize: number;
 metadata?: object;
}

export interface FileUpload {
 role: FileUploadRole;
 file: File | null;
 record: FileUploadRecord;
 chunksSent: number[];
 uploadInterval: NodeJS.Timeout | null;
 paused?: boolean;
 running?: boolean; // todo: maybe refactor to setTimeout (see upload.pushChunk)
 uploadedBytes?: number; // only for non senders
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
 chunkSize: number;
 offsetBytes: number;
 data: Uint8Array;
}

export interface FileUploadBeginOptions {
 chunkSize?: number;
}

export type MakeFileUploadRecordData = Partial<FileUploadRecord> & Pick<FileUploadRecord, 'type' | 'fileOriginalName' | 'fileMimeType' | 'fileSize' | 'chunkSize' | 'fromUserUid' | 'metadata'>;

export type MakeFileUploadData = Partial<FileUpload> & Pick<FileUpload, 'role' | 'file' | 'record' | 'acc'>;

export type MakeFileDownloadData = Partial<FileDownload> & Pick<FileDownload, 'record'>;

export type FileUploadStoreValue = FileUpload[];

export type FileDownloadStoreValue = FileDownload[];

export type BaseStoreType<StoreValue, Item> = {
 store: Writable<StoreValue>;
 getAll: () => StoreValue;
 get: (id: string) => Item | undefined;
 set: (id: string, download: Item) => void;
 patch: (id: string, data: Partial<Item>) => void;
 delete: (id: string) => void;
};

export type FileUploadStoreType = {
 updateUploadRecord: (id: string, record: FileUploadRecord) => void;
 isAnyUploadRunning: () => boolean;
} & BaseStoreType<FileUploadStoreValue, FileUpload>;

export type FileDownloadStoreType = {
 updateDownloadRecord: (id: string, record: FileUploadRecord) => void;
 isAnyDownloadRunning: () => boolean;
} & BaseStoreType<FileDownloadStoreValue, FileDownload>;
