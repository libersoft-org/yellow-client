import { type FileDownload, type FileDownloadStoreType, type FileUploadChunk, type FileUploadRecord, FileUploadRecordStatus } from './types.ts';
import { makeFileDownload } from './utils.ts';
import EventEmitter from 'events';
import fileDownloadStore from '../../stores/FileDownloadStore.ts';

export class FileDownloadService extends EventEmitter {
	downloadStore: FileDownloadStoreType;

	constructor(downloadStore: FileDownloadStoreType) {
		super();
		this.downloadStore = downloadStore;
	}

	async startDownloadSerial(
		records: FileUploadRecord[],
		pullChunkFn: (data: { uploadId: string; offsetBytes: number; chunkSize: number }) => Promise<{
			chunk: FileUploadChunk;
		}>,
		finishCallback: (download: FileDownload) => void
	) {
		for (const record of records) {
			let download: FileDownload | undefined = this.downloadStore.get(record.id);

			if (!download) {
				download = makeFileDownload({ record });
				this.downloadStore.set(record.id, download);
			}

			download.pullChunk = async () => {
				const retry = () => {
					setTimeout(() => {
						download.pullChunk && download.pullChunk();
					}, 1000);
				};
				const setRunning = (running: boolean) => {
					download.running = running;
					this.downloadStore.set(record.id, download);
				};

				if (download.canceledLocally) {
					this.downloadStore.delete(record.id);
					return;
				}
				if (
					// check for server pause status
					download.record.status === FileUploadRecordStatus.PAUSED ||
					// check for local pause flag
					download.pausedLocally
				) {
					setRunning(false);
					retry();
					return;
				}
				if (download?.record.status === FileUploadRecordStatus.CANCELED || download?.record.status === FileUploadRecordStatus.ERROR) {
					setRunning(false);
					// TODO: clear memory
					return;
				}

				try {
					setRunning(true);
					const chunkSize = record.chunkSize;
					const { chunk } = await pullChunkFn({
						uploadId: record.id,
						offsetBytes: download.chunksReceived.length * chunkSize,
						chunkSize: record.chunkSize,
					});

					// Decode Base64 chunk back to binary
					download.chunksReceived[chunk.chunkId] = chunk.data; // Store chunk in the correct order
					this.downloadStore.set(record.id, download);

					// Check if all chunks have been received
					if (download.chunksReceived.length * chunkSize >= record.fileSize) {
						setRunning(false);
						finishCallback && finishCallback(download);
						setTimeout(() => this.startNextDownload(download));
						this.downloadStore.delete(record.id);
						// Clean up memory
						// download.chunksReceived = [];
					} else {
						download.pullChunk && (await download.pullChunk());
					}
				} catch (e) {
					// try again
					// TODO: check for specific errors
					retry();
				}
			};
			this.startDownload(download);
		}
	}

	async startDownload(download: FileDownload) {
		if (this.downloadStore.isAnyDownloadRunning()) {
			return;
		}
		download.pullChunk && (await download.pullChunk());
	}

	async startNextDownload(lastDownload: FileDownload) {
		if (this.downloadStore.isAnyDownloadRunning()) {
			return;
		}
		const downloads = this.downloadStore.getAll();
		let nextDownload: FileDownload | undefined;
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
			await this.startDownload(nextDownload);
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
		}
	}
}

const fileDownloadManager = new FileDownloadService(fileDownloadStore);
export default fileDownloadManager;
