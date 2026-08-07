import { get } from 'svelte/store';
import filesDB, { type ILocalFile, LocalFileStatus } from '@/org.libersoft.messages/services/LocalDB/FilesLocalDB.ts';
import { active_account } from '@/core/scripts/core.ts';
import { loadUploadData, makeDownloadChunkAsyncFn } from '@/org.libersoft.messages/scripts/messages.ts';
import fileUploadManager, { type FileUploadService } from './FileUploadService.ts';
import fileDownloadManager, { type FileDownloadService } from './FileDownloadService.ts';
import { accountScopeKey, transferKey } from './accountScope.ts';
import type { IFileDownload } from './types.ts';
import { liveQuery } from 'dexie';

export class FilesService {
	fileUploadManager: FileUploadService;
	fileDownloadManager: FileDownloadService;
	/* Keyed by account scope + upload id: the same upload id can exist on two servers. */
	private attachmentRequests = new Map<string, Promise<{ localFile: ILocalFile }>>();

	constructor(fileUploadManager: FileUploadService, fileDownloadManager: FileDownloadService) {
		this.fileUploadManager = fileUploadManager;
		this.fileDownloadManager = fileDownloadManager;
	}

	getOrDownloadAttachment(uploadId: string): Promise<{ localFile: ILocalFile }> {
		const acc = get(active_account);
		const scopeKey = accountScopeKey(acc);
		if (!acc || !scopeKey) return Promise.reject(new Error('Cannot download an attachment without an active account'));
		const requestKey = transferKey(scopeKey, uploadId);
		const existingRequest = this.attachmentRequests.get(requestKey);
		if (existingRequest) return existingRequest;
		const request = this.loadOrDownloadAttachment(scopeKey, uploadId);
		this.attachmentRequests.set(requestKey, request);
		const forget = (): void => {
			this.attachmentRequests.delete(requestKey);
		};
		request.then(forget, forget);
		return request;
	}

	private async loadOrDownloadAttachment(scopeKey: string, uploadId: string): Promise<{ localFile: ILocalFile }> {
		const acc = get(active_account);
		if (!acc) throw new Error('Cannot download an attachment without an active account');
		const localFile = await filesDB.findFile(scopeKey, uploadId);
		if (localFile?.localFileStatus === LocalFileStatus.READY) return { localFile };
		if (localFile && this.fileDownloadManager.downloadStore.get(uploadId)) return this.waitForExistingDownload(scopeKey, uploadId);
		if (localFile) await filesDB.deleteFile(localFile.id);

		const { record } = await loadUploadData(uploadId);
		const newLocalFile: Omit<ILocalFile, 'id'> = {
			accountKey: scopeKey,
			localFileStatus: LocalFileStatus.DOWNLOADING,
			fileTransferId: record.id,
			fileOriginalName: record.fileOriginalName,
			fileMimeType: record.fileMimeType,
			fileSize: record.fileSize,
		};
		const localFileId = await filesDB.addFile(newLocalFile);
		return new Promise<{ localFile: ILocalFile }>((resolve, reject): void => {
			let settled = false;
			let unsubscribe = (): void => {};
			const complete = (callback: () => void): void => {
				if (settled) return;
				settled = true;
				unsubscribe();
				callback();
			};
			const startPromise = this.fileDownloadManager.startDownloadSerial(
				[record],
				makeDownloadChunkAsyncFn(acc),
				async (download: IFileDownload): Promise<void> => {
					const fileBlob = new Blob(download.chunksReceived, { type: record.fileMimeType });
					const completedFile: ILocalFile = {
						...newLocalFile,
						id: localFileId,
						localFileStatus: LocalFileStatus.READY,
						fileBlob,
					};
					const updatedCount = await filesDB.updateFile(scopeKey, record.id, {
						localFileStatus: completedFile.localFileStatus,
						fileBlob,
					});
					if (updatedCount === 0) throw new Error('Downloaded attachment record is missing from IndexedDB');
					complete((): void => resolve({ localFile: completedFile }));
				},
				scopeKey
			);
			unsubscribe = this.fileDownloadManager.downloadStore.store.subscribe((): void => {
				if (!settled && !this.fileDownloadManager.downloadStore.get(uploadId)) complete((): void => reject(new Error('Attachment download was canceled or failed')));
			});
			startPromise.catch((error: unknown): void => complete((): void => reject(error)));
		});
	}

	private waitForExistingDownload(scopeKey: string, uploadId: string): Promise<{ localFile: ILocalFile }> {
		return new Promise<{ localFile: ILocalFile }>((resolve, reject): void => {
			let settled = false;
			let downloadUnsubscribe = (): void => {};
			let dbSubscription: { unsubscribe: () => void } | undefined;
			const complete = (callback: () => void): void => {
				if (settled) return;
				settled = true;
				dbSubscription?.unsubscribe();
				downloadUnsubscribe();
				callback();
			};
			dbSubscription = liveQuery(() => filesDB.findFile(scopeKey, uploadId)).subscribe({
				next: (localFile: ILocalFile | undefined): void => {
					if (localFile?.localFileStatus === LocalFileStatus.READY) complete((): void => resolve({ localFile }));
				},
				error: (error: unknown): void => complete((): void => reject(error)),
			});
			downloadUnsubscribe = this.fileDownloadManager.downloadStore.store.subscribe((): void => {
				if (settled || this.fileDownloadManager.downloadStore.get(uploadId)) return;
				void filesDB
					.findFile(scopeKey, uploadId)
					.then((localFile: ILocalFile | undefined): void => {
						if (localFile?.localFileStatus === LocalFileStatus.READY) complete((): void => resolve({ localFile }));
						else complete((): void => reject(new Error('Attachment download was canceled or failed')));
					})
					.catch((error: unknown): void => complete((): void => reject(error)));
			});
		});
	}
}

const filesService = new FilesService(fileUploadManager, fileDownloadManager);
export default filesService;
