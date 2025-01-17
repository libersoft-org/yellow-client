import type { Writable } from 'svelte/store'

export interface FileUploadStores {
 uploads: Writable<FileUploadRecord[]>;
}

export enum FileUploadType {
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
 STOPPED = 'STOPPED',
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

export type MakeFileUploadRecordData = Partial<FileUploadRecord>
 & Pick<FileUploadRecord, 'type' | 'fileName' | 'fileMimeType' | 'fileSize' | 'chunkSize'>
