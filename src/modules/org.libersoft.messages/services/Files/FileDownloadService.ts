import { type IFileDownload, type FileDownloadStoreType, type IFileUploadChunk, type IFileUploadRecord, FileUploadRecordStatus, type IFileUpload, type PullChunkFnType } from './types.ts';
import { makeFileDownload } from './utils.ts';
import EventEmitter from 'events';
import fileDownloadStore from '../../stores/FileDownloadStore.ts';
import { call, each, exit, interval, run, sleep } from 'effection';

export class FileDownloadService extends EventEmitter {
	downloadStore: FileDownloadStoreType;

	constructor(downloadStore: FileDownloadStoreType) {
		super();
		this.downloadStore = downloadStore;
	}

	initAndStartDownloads(records: IFileUploadRecord[], pullChunkFn: PullChunkFnType) {
		const downloads: IFileDownload[] = [];
		for (const record of records) {
			let download: IFileDownload | undefined = this.downloadStore.get(record.id);

			if (!download) {
				download = makeFileDownload({ record, pullChunkFn, downloadResolver: Promise.withResolvers<IFileDownload>() });
				this.downloadStore.set(record.id, download);
			}
			downloads.push(download);
		}

		if (downloads.length) {
			this.startDownloadSerial(downloads[0]);
		}

		return { downloads };
	}

	startDownloadSerial(download: IFileDownload) {
		const self = this;
		const record = download.record;

		function* pullNextChunk() {
			const chunkSize = record.chunkSize;

			if (!download.pullChunkFn) {
				yield* exit(1, 'Download pull function is not defined');
			}

			// @ts-ignore
			const { chunk } = yield* call(() =>
				download.pullChunkFn({
					uploadId: record.id,
					offsetBytes: download.chunksReceived.length * chunkSize,
					chunkSize: record.chunkSize,
				})
			);

			download.chunksReceived[chunk.chunkId] = chunk.data; // Store chunk in the correct order
			self.downloadStore.set(record.id, download);
		}

		return run(function* () {
			try {
				while (true) {
					console.log('RUNNING DOWNLOAD LOOP', download);
					if (download.canceledLocally || record.status === FileUploadRecordStatus.CANCELED || record.status === FileUploadRecordStatus.ERROR) {
						break; // goes to finally
					}

					while (download.record.status === FileUploadRecordStatus.PAUSED || download.pausedLocally) {
						yield* sleep(500);
					}

					if (!download.running) {
						download.running = true;
						self.downloadStore.set(record.id, download);
					}

					// Check if all chunks have been received
					if (download.chunksReceived.length * record.chunkSize >= record.fileSize) {
						self.downloadStore.delete(record.id);
						download?.downloadResolver?.resolve(download);
						console.log('FINIShED DOWNLOAD', record.id);
						break; // goes to finally
					}

					try {
						yield* pullNextChunk();
					} catch (error: any) {
						if (error?.error === 'WAIT_FOR_CHUNK') {
							yield* sleep(1000);
						}
					}
				}
			} catch (err) {
				console.error('DOWNLOAD ERROR', err);
			} finally {
				// Finish & cleanup after exit was yielded
				if (download.canceledLocally) {
					self.downloadStore.delete(record.id);
				} else if (self.downloadStore.get(record.id)) {
					download.running = false;
					self.downloadStore.set(record.id, download);
				}
				if (!download.pausedLocally) {
					self.startNextDownload(download);
				}
			}
		});
	}

	async startNextDownload(lastDownload: IFileDownload) {
		if (this.downloadStore.isAnyDownloadRunning()) {
			return;
		}
		const downloads = this.downloadStore.getAll();
		let nextDownload: IFileDownload | undefined;
		const lastDownloadIndex = downloads.findIndex(d => d.record.id === lastDownload.record.id);

		// find next download
		for (let i = lastDownloadIndex + 1; i < downloads.length; i++) {
			const download = downloads[i];
			if (!download.pausedLocally && !download.canceledLocally) {
				nextDownload = download;
				break;
			}
		}

		if (nextDownload) {
			await this.startDownloadSerial(nextDownload);
		}
	}

	async pauseDownload(uploadId: string) {
		const download = this.downloadStore.get(uploadId);
		if (download) {
			download.pausedLocally = true;
			this.downloadStore.set(uploadId, download);
		}
	}

	async resumeDownload(uploadId: string) {
		const download = this.downloadStore.get(uploadId);
		if (download) {
			download.pausedLocally = false;
			this.downloadStore.set(uploadId, download);
		}
	}

	async cancelDownload(uploadId: string) {
		const download = this.downloadStore.get(uploadId);
		if (download) {
			download.canceledLocally = true;
			this.downloadStore.set(uploadId, download);
			console.log('cancelled download', download);
		}
	}
}

const fileDownloadManager = new FileDownloadService(fileDownloadStore);
export default fileDownloadManager;
