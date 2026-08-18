import type { Writable } from 'svelte/store';
import type { ITransferScope } from './accountScope.ts';

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
	/** Owning account scope, captured at creation - see services/Files/accountScope.ts. */
	accountKey: string;
	chunksSent: number[];
	uploadInterval: NodeJS.Timeout | null;
	paused?: boolean;
	running?: boolean; // TODO: maybe refactor to setTimeout (see upload.pushChunk)
	uploadedBytes?: number; // only for non senders
	pushChunk?: (() => Promise<void>) | undefined;
	acc: any;
}

export interface IFileDownload {
	record: IFileUploadRecord;
	/** Owning account scope, captured at creation - see services/Files/accountScope.ts. */
	accountKey: string;
	/** Set when the transfer failed terminally, so waiters can report the real cause. */
	error?: Error;
	chunksReceived: any[];
	data: any;
	createdAt: number;
	running: boolean;
	pausedLocally?: boolean;
	canceledLocally?: boolean;
	pullChunk?: () => Promise<void>;
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

export type MakeFileUploadData = Partial<IFileUpload> & Pick<IFileUpload, 'role' | 'file' | 'record' | 'acc' | 'accountKey'>;

export type MakeFileDownloadData = Partial<IFileDownload> & Pick<IFileDownload, 'record' | 'accountKey'>;

export type FileUploadStoreValue = IFileUpload[];

export type FileDownloadStoreValue = IFileDownload[];

export type BaseStoreType<StoreValue, Item> = {
	store: Writable<StoreValue>;
	getAll: () => StoreValue;
	getAllForAccount: (accountKey: string) => StoreValue;
	/* Every lookup carries the owning scope explicitly - the stores never consult the active
	 * account on their own. */
	get: (scope: ITransferScope | null) => Item | undefined;
	set: (scope: ITransferScope, item: Item) => void;
	patch: (scope: ITransferScope, data: Partial<Item>) => void;
	delete: (scope: ITransferScope) => void;
};

export type FileUploadStoreType = {
	updateUploadRecord: (scope: ITransferScope, record: IFileUploadRecord) => void;
	isAnyUploadRunning: (accountKey?: string) => boolean;
} & BaseStoreType<FileUploadStoreValue, IFileUpload>;

export type FileDownloadStoreType = {
	updateDownloadRecord: (scope: ITransferScope, record: IFileUploadRecord) => void;
	isAnyDownloadRunning: (accountKey?: string) => boolean;
} & BaseStoreType<FileDownloadStoreValue, IFileDownload>;

export interface IFileChunkData {
	chunkId: number;
	uploadId: string;
	checksum: string;
	data: string;
}

export interface IGetChunkResult {
	chunk: IFileChunkData;
	upload: IFileUpload;
	blob: Blob;
}

export interface IPullChunkRequest {
	uploadId: string;
	offsetBytes: number;
	chunkSize: number;
}

export type PullChunkFn = (data: IPullChunkRequest) => Promise<{ chunk: IFileUploadChunk }>;
