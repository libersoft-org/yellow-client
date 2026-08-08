import { get } from 'svelte/store';
import filesDB, { type ILocalFile, LocalFileStatus } from '@/org.libersoft.messages/services/LocalDB/FilesLocalDB.ts';
import { active_account } from '@/core/scripts/core.ts';
import { loadUploadData, makeDownloadChunkAsyncFn } from '@/org.libersoft.messages/scripts/messages.ts';
import fileUploadManager, { type FileUploadService } from './FileUploadService.ts';
import fileDownloadManager, { DOWNLOAD_ERROR_EVENT, type FileDownloadService, type IDownloadErrorEvent } from './FileDownloadService.ts';
import { accountScopeKey, scopeAccountKey, transferKey, transferScope, type ITransferScope } from './accountScope.ts';
import type { IFileDownload, IFileUploadRecord } from './types.ts';
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
		const scope = transferScope(acc, uploadId);
		if (!acc || !scopeKey || !scope) return Promise.reject(new Error('Cannot download an attachment without an active account'));
		const requestKey = transferKey(scopeKey, uploadId);
		const existingRequest = this.attachmentRequests.get(requestKey);
		if (existingRequest) return existingRequest;
		const request = this.loadOrDownloadAttachment(scopeKey, scope);
		this.attachmentRequests.set(requestKey, request);
		const forget = (): void => {
			this.attachmentRequests.delete(requestKey);
		};
		request.then(forget, forget);
		return request;
	}

	private async loadOrDownloadAttachment(scopeKey: string, scope: ITransferScope): Promise<{ localFile: ILocalFile }> {
		const uploadId = scope.uploadId;
		const acc = get(active_account);
		if (!acc) throw new Error('Cannot download an attachment without an active account');
		const localFile = await filesDB.findFile(scopeKey, uploadId);
		if (localFile?.localFileStatus === LocalFileStatus.READY) return { localFile };
		if (localFile && this.fileDownloadManager.downloadStore.get(scope)) return this.waitForExistingDownload(scopeKey, scope);
		if (localFile) await filesDB.deleteFile(localFile.id);

		const { record } = await loadUploadData(scope);
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
			/* The service reports a terminal failure explicitly, so the waiter can surface the real
			 * cause instead of a generic "canceled or failed". Matched on the whole scope: two accounts
			 * can hold the same upload id, and one account's dead transfer must not reject the other's
			 * waiter. */
			const onDownloadError = (event: IDownloadErrorEvent): void => {
				if (event.uploadId !== scope.uploadId || event.accountKey !== scopeAccountKey(scope)) return;
				complete((): void => reject(event.error));
			};
			this.fileDownloadManager.on(DOWNLOAD_ERROR_EVENT, onDownloadError);
			const complete = (callback: () => void): void => {
				if (settled) return;
				settled = true;
				unsubscribe();
				this.fileDownloadManager.off(DOWNLOAD_ERROR_EVENT, onDownloadError);
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
				scope,
				/* Only consulted while waiting for the sender's `upload_commit` to publish the digest. */
				async (): Promise<IFileUploadRecord | null> => (await loadUploadData(scope))?.record ?? null
			);
			unsubscribe = this.fileDownloadManager.downloadStore.store.subscribe((): void => {
				if (!settled && !this.fileDownloadManager.downloadStore.get(scope)) complete((): void => reject(new Error('Attachment download was canceled or failed')));
			});
			startPromise.catch((error: unknown): void => complete((): void => reject(error)));
		});
	}

	private waitForExistingDownload(scopeKey: string, scope: ITransferScope): Promise<{ localFile: ILocalFile }> {
		const uploadId = scope.uploadId;
		return new Promise<{ localFile: ILocalFile }>((resolve, reject): void => {
			let settled = false;
			let downloadUnsubscribe = (): void => {};
			let dbSubscription: { unsubscribe: () => void } | undefined;
			const onDownloadError = (event: IDownloadErrorEvent): void => {
				if (event.uploadId !== scope.uploadId || event.accountKey !== scopeAccountKey(scope)) return;
				complete((): void => reject(event.error));
			};
			this.fileDownloadManager.on(DOWNLOAD_ERROR_EVENT, onDownloadError);
			const complete = (callback: () => void): void => {
				if (settled) return;
				settled = true;
				dbSubscription?.unsubscribe();
				downloadUnsubscribe();
				this.fileDownloadManager.off(DOWNLOAD_ERROR_EVENT, onDownloadError);
				callback();
			};
			dbSubscription = liveQuery(() => filesDB.findFile(scopeKey, uploadId)).subscribe({
				next: (localFile: ILocalFile | undefined): void => {
					if (localFile?.localFileStatus === LocalFileStatus.READY) complete((): void => resolve({ localFile }));
				},
				error: (error: unknown): void => complete((): void => reject(error)),
			});
			downloadUnsubscribe = this.fileDownloadManager.downloadStore.store.subscribe((): void => {
				if (settled || this.fileDownloadManager.downloadStore.get(scope)) return;
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
