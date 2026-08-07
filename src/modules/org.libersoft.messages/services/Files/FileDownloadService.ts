import { type IFileDownload, type FileDownloadStoreType, type IFileUploadRecord, FileUploadRecordStatus, type PullChunkFn } from './types.ts';
import { makeFileDownload, sha256Hex } from './utils.ts';
import EventEmitter from 'events';
import fileDownloadStore from '../../stores/FileDownloadStore.ts';

/** Retry pacing for transient chunk failures. Without a ceiling a dead transfer retries forever. */
const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 30_000;
const MAX_RETRIES = 8;
/** Refuse absurd chunk sizes announced by the server before allocating anything. */
const MAX_CHUNK_SIZE = 8 * 1024 * 1024;

export class FileDownloadService extends EventEmitter {
	downloadStore: FileDownloadStoreType;

	constructor(downloadStore: FileDownloadStoreType) {
		super();
		this.downloadStore = downloadStore;
	}

	async startDownloadSerial(records: IFileUploadRecord[], pullChunkFn: PullChunkFn, finishCallback: (download: IFileDownload) => void | Promise<void>, accountKey?: string | null): Promise<void> {
		for (const record of records) {
			if (!Number.isSafeInteger(record.chunkSize) || record.chunkSize <= 0 || record.chunkSize > MAX_CHUNK_SIZE) throw new Error('Invalid chunk size in upload record');
			if (!Number.isSafeInteger(record.fileSize) || record.fileSize < 0) throw new Error('Invalid file size in upload record');
			let download: IFileDownload | undefined = this.downloadStore.get(record.id);
			if (!download) {
				download = makeFileDownload({ record, accountKey: accountKey ?? null });
				this.downloadStore.set(record.id, download);
			}
			const totalChunks = Math.ceil(record.fileSize / record.chunkSize);
			let retries = 0;
			download.pullChunk = async () => {
				const retry = (error: unknown) => {
					if (retries >= MAX_RETRIES) {
						setRunning(false);
						download.record.status = FileUploadRecordStatus.ERROR;
						this.downloadStore.set(record.id, download);
						console.error('Download failed permanently:', record.id, error);
						return;
					}
					/* Exponential backoff with jitter, so a server that keeps refusing does not turn into
					 * a one-request-per-second flood. */
					const delay = Math.min(RETRY_BASE_MS * 2 ** retries, RETRY_MAX_MS);
					retries++;
					setTimeout(
						() => {
							download.pullChunk && void download.pullChunk();
						},
						delay + Math.floor(Math.random() * 250)
					);
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
					/* A pause is not a failure - keep polling at the base interval without consuming the
					 * retry budget. */
					setTimeout(() => {
						download.pullChunk && void download.pullChunk();
					}, RETRY_BASE_MS);
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
					const expectedChunkId = download.chunksReceived.filter(c => c !== undefined).length;
					const offsetBytes = expectedChunkId * chunkSize;
					const { chunk } = await pullChunkFn({
						uploadId: record.id,
						offsetBytes,
						chunkSize,
					});
					await this.verifyChunk(chunk, { record, expectedChunkId, offsetBytes, totalChunks });
					/* Index by the chunk id we asked for, never by the one the server echoed back:
					 * a hostile or buggy value would create a sparse array of arbitrary length. */
					download.chunksReceived[expectedChunkId] = chunk.data;
					retries = 0;
					this.downloadStore.set(record.id, download);
					const totalReceived = download.chunksReceived.filter(c => c !== undefined).length;
					// Check if all chunks have been received
					if (totalReceived >= totalChunks) {
						const assembledSize = download.chunksReceived.reduce((sum: number, c: any) => sum + (c?.byteLength ?? c?.length ?? 0), 0);
						if (assembledSize !== record.fileSize) throw new Error(`Assembled file size ${assembledSize} does not match declared size ${record.fileSize}`);
						setRunning(false);
						await finishCallback(download);
						download.chunksReceived = [];
						setTimeout(() => this.startNextDownload(download));
						this.downloadStore.delete(record.id);
					} else {
						download.pullChunk && (await download.pullChunk());
					}
				} catch (e) {
					const totalReceived = download.chunksReceived.filter(c => c !== undefined).length;
					if (totalReceived >= totalChunks) {
						setRunning(false);
						this.downloadStore.delete(record.id);
						throw e;
					}
					// try again
					// TODO: check for specific errors
					retry(e);
				}
			};
			await this.startDownload(download);
		}
	}

	/** Structural and cryptographic validation of a single chunk before it is stored. */
	private async verifyChunk(chunk: any, context: { record: IFileUploadRecord; expectedChunkId: number; offsetBytes: number; totalChunks: number }): Promise<void> {
		const { record, expectedChunkId, offsetBytes, totalChunks } = context;
		if (!chunk || !chunk.data) throw new Error('Empty chunk received');
		if (chunk.uploadId !== undefined && chunk.uploadId !== record.id) throw new Error('Chunk belongs to a different upload');
		if (chunk.chunkId !== undefined && chunk.chunkId !== expectedChunkId) throw new Error(`Unexpected chunk id ${chunk.chunkId}, expected ${expectedChunkId}`);
		if (chunk.offsetBytes !== undefined && chunk.offsetBytes !== offsetBytes) throw new Error(`Unexpected chunk offset ${chunk.offsetBytes}, expected ${offsetBytes}`);
		const isLastChunk = expectedChunkId === totalChunks - 1;
		const expectedLength = isLastChunk ? record.fileSize - offsetBytes : record.chunkSize;
		const actualLength = chunk.data.byteLength ?? chunk.data.length;
		if (actualLength !== expectedLength) throw new Error(`Chunk length ${actualLength} does not match expected ${expectedLength}`);
		/* Senders that predate per-chunk checksums send an empty string; structural checks above still
		 * apply in that case. */
		if (typeof chunk.checksum === 'string' && chunk.checksum.length > 0) {
			const actual = await sha256Hex(chunk.data);
			if (actual && actual !== chunk.checksum) throw new Error('Chunk checksum mismatch');
		}
	}

	async startDownload(download: IFileDownload): Promise<void> {
		if (this.downloadStore.isAnyDownloadRunning()) return;
		download.pullChunk && (await download.pullChunk());
	}

	async startNextDownload(lastDownload: IFileDownload): Promise<void> {
		if (this.downloadStore.isAnyDownloadRunning()) {
			return;
		}
		const downloads = this.downloadStore.getAll();
		let nextDownload: IFileDownload | undefined;
		const lastDownloadIndex = downloads.findIndex(d => d.record.id === lastDownload.record.id);

		// find next download
		for (let i = lastDownloadIndex + 1; i < downloads.length; i++) {
			const download = downloads[i]!;
			if (!download.pausedLocally && !download.canceledLocally) {
				nextDownload = download;
				break;
			}
		}

		if (nextDownload) {
			await this.startDownload(nextDownload);
		}
	}

	async pauseDownload(uploadId: string): Promise<void> {
		const download = this.downloadStore.get(uploadId);
		if (download) {
			download.pausedLocally = true;
			this.downloadStore.set(uploadId, download);
		}
	}

	async resumeDownload(uploadId: string): Promise<void> {
		const download = this.downloadStore.get(uploadId);
		if (download) {
			download.pausedLocally = false;
			this.downloadStore.set(uploadId, download);
		}
	}

	async cancelDownload(uploadId: string): Promise<void> {
		const download = this.downloadStore.get(uploadId);
		if (download) {
			download.canceledLocally = true;
			this.downloadStore.set(uploadId, download);
		}
	}
}

const fileDownloadManager = new FileDownloadService(fileDownloadStore);
export default fileDownloadManager;
