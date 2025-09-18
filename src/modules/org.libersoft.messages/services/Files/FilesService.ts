import { get } from 'svelte/store';
import filesDB, { type ILocalFile, LocalFileStatus } from '@/org.libersoft.messages/services/LocalDB/FilesLocalDB.ts';
import { active_account } from '@/core/scripts/core.ts';
import { loadUploadData, makeDownloadChunkAsyncFn } from '@/org.libersoft.messages/scripts/messages.js';
import fileUploadManager, { type FileUploadService } from './FileUploadService.ts';
import fileDownloadManager, { type FileDownloadService } from './FileDownloadService.ts';
import { liveQuery } from 'dexie';

export class FilesService {
	fileUploadManager: FileUploadService;
	fileDownloadManager: FileDownloadService;

	constructor(fileUploadManager: FileUploadService, fileDownloadManager: FileDownloadService) {
		this.fileUploadManager = fileUploadManager;
		this.fileDownloadManager = fileDownloadManager;
	}

	getOrDownloadAttachment(uploadId: string): Promise<{ localFile: ILocalFile }> {
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

			const newLocalFile: Omit<ILocalFile, 'id'> = {
				localFileStatus: LocalFileStatus.DOWNLOADING,
				fileTransferId: record.id,
				fileOriginalName: record.fileOriginalName,
				fileMimeType: record.fileMimeType,
				fileSize: record.fileSize,
			};

			await filesDB.addFile(newLocalFile);

			const { downloads } = this.fileDownloadManager.initAndStartDownloads([record], makeDownloadChunkAsyncFn(acc));
			downloads.forEach(download =>
				download?.downloadResolver?.promise.then(async download => {
					newLocalFile.localFileStatus = LocalFileStatus.READY;
					newLocalFile.fileBlob = new Blob(download.chunksReceived, { type: record.fileMimeType });
					// const result = await filesDB.updateFile(record.id, newLocalFile);
					resolve({ localFile: newLocalFile as ILocalFile });
				})
			);
		});
	}
}

const filesService = new FilesService(fileUploadManager, fileDownloadManager);
export default filesService;
