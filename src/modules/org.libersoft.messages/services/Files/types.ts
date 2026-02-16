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

export interface ICustomFile extends File {
	metadata: object | null;
}

export interface IFileUploadRecord {
	id: string;
	type: FileUploadRecordType;
	status: FileUploadRecordStatus;
	errorType: FileUploadRecordErrorType | null;
	fileOriginalName: string;
	fromUserUid: string;
	fileMimeType: string;
	fileSize: number;

	chunkSize: number;
	metadata: object | null;
}

export interface IFileUpload {
	role: FileUploadRole;
	file: ICustomFile | null;
	record: IFileUploadRecord;
	chunksSent: number[];
	uploadInterval: NodeJS.Timeout | null;
	paused?: boolean;
	running?: boolean; // TODO: maybe refactor to setTimeout (see upload.pushChunk)
	uploadedBytes?: number; // only for non senders
	pushChunk?: () => Promise<void>;
	pushFn?: PushChunkFnType;
	acc: any;
}

export interface IFileDownload {
	record: IFileUploadRecord;
	chunksReceived: any[];
	data: any;
	createdAt: number;
	running: boolean;
	pausedLocally?: boolean;
	canceledLocally?: boolean;
	pullChunk?: () => Promise<void>;
	pullChunkFn?: PullChunkFnType;
	downloadResolver?: PromiseWithResolvers<IFileDownload>;
}

export interface IFileUploadChunk {
	chunkId: number;
	uploadId: string;
	checksum: string;
	chunkSize: number;
	offsetBytes: number;
	data: Uint8Array;
}

export interface IFileUploadBeginOptions {
	chunkSize?: number;
}

export type MakeFileUploadRecordData = Partial<IFileUploadRecord> & Pick<IFileUploadRecord, 'type' | 'fileOriginalName' | 'fileMimeType' | 'fileSize' | 'chunkSize' | 'fromUserUid' | 'metadata'>;

export type MakeFileUploadData = Partial<IFileUpload> & Pick<IFileUpload, 'role' | 'file' | 'record' | 'acc' | 'pushFn'>;

export type MakeFileDownloadData = Partial<IFileDownload> & Pick<IFileDownload, 'record'>;

export type FileUploadStoreValue = IFileUpload[];

export type FileDownloadStoreValue = IFileDownload[];

export type BaseStoreType<StoreValue, Item> = {
	store: Writable<StoreValue>;
	getAll: () => StoreValue;
	get: (id: string) => Item | undefined;
	set: (id: string, download: Item) => void;
	patch: (id: string, data: Partial<Item>) => void;
	delete: (id: string) => void;
};

export type FileUploadStoreType = {
	updateUploadRecord: (id: string, record: IFileUploadRecord) => void;
	isAnyUploadRunning: () => boolean;
} & BaseStoreType<FileUploadStoreValue, IFileUpload>;

export type FileDownloadStoreType = {
	updateDownloadRecord: (id: string, record: IFileUploadRecord) => void;
	isAnyDownloadRunning: () => boolean;
} & BaseStoreType<FileDownloadStoreValue, IFileDownload>;

export type PushChunkFnType = (data: { chunk: IFileUploadChunk; upload: IFileUpload }) => Promise<void>;
export type PullChunkFnType = (data: { uploadId: string; offsetBytes: number; chunkSize: number }) => Promise<{ chunk: IFileUploadChunk }>;
