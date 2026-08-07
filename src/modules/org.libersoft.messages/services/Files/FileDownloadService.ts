import { type IFileDownload, type FileDownloadStoreType, type IFileUploadRecord, FileUploadRecordStatus, type PullChunkFn } from './types.ts';
import { fileDigestFromChunkHashes, makeFileDownload, sha256Hex } from './utils.ts';
import { scopeAccountKey, type ITransferScope } from './accountScope.ts';
import EventEmitter from 'events';
import fileDownloadStore from '../../stores/FileDownloadStore.ts';

/** Retry pacing for transient chunk failures. Without a ceiling a dead transfer retries forever. */
const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 30_000;
const MAX_RETRIES = 8;
/** Event emitted once a transfer has failed for good. See the note at the emit site. */
export const DOWNLOAD_ERROR_EVENT = 'download-error';

/** Payload of {@link DOWNLOAD_ERROR_EVENT}. */
export interface IDownloadErrorEvent {
	uploadId: string;
	accountKey: string;
	error: Error;
}

/** Refuse absurd chunk sizes announced by the server before allocating anything. */
const MAX_CHUNK_SIZE = 8 * 1024 * 1024;

/* Whether a chunk without a checksum, or a transfer without a whole-file digest, is accepted.
 *
 * Now enforced. Leaving it optional meant a peer could skip verification entirely by sending
 * `checksum: ''`, which made the integrity work advisory rather than binding. Every sender in this
 * codebase has computed per-chunk SHA-256 since that work landed; the cost of enforcing is that
 * files from senders older than that are refused rather than accepted unverified.
 *
 * Structural verification (chunk id, offset, length, total size) applies either way. */
export const REQUIRE_CHUNK_CHECKSUMS = true;

export class FileDownloadService extends EventEmitter {
	downloadStore: FileDownloadStoreType;

	constructor(downloadStore: FileDownloadStoreType) {
		super();
		this.downloadStore = downloadStore;
	}

	async startDownloadSerial(records: IFileUploadRecord[], pullChunkFn: PullChunkFn, finishCallback: (download: IFileDownload) => void | Promise<void>, owner: ITransferScope | null): Promise<void> {
		if (!owner) throw new Error('Cannot download without an owning account');
		const accountKey = scopeAccountKey(owner);
		for (const record of records) {
			if (!Number.isSafeInteger(record.chunkSize) || record.chunkSize <= 0 || record.chunkSize > MAX_CHUNK_SIZE) throw new Error('Invalid chunk size in upload record');
			if (!Number.isSafeInteger(record.fileSize) || record.fileSize < 0) throw new Error('Invalid file size in upload record');
			/* The scope of this transfer, fixed for its whole lifetime. */
			const scope: ITransferScope = { accountId: owner.accountId, server: owner.server, uploadId: record.id };
			let download: IFileDownload | undefined = this.downloadStore.get(scope);
			if (!download) {
				download = makeFileDownload({ record, accountKey });
				this.downloadStore.set(scope, download);
			}
			const totalChunks = Math.ceil(record.fileSize / record.chunkSize);
			/* Per-chunk hashes in arrival order, folded into the whole-file digest at the end. */
			const chunkHashes: string[] = [];
			const expectedFileDigest = typeof (record.metadata as any)?.fileDigest === 'string' ? ((record.metadata as any).fileDigest as string) : null;
			let retries = 0;
			download.pullChunk = async () => {
				const retry = (error: unknown) => {
					if (retries >= MAX_RETRIES) {
						/* Terminal failure. The record has to leave the store and an explicit failure has
						 * to be emitted: anyone waiting on this transfer watches the store, so leaving a
						 * dead entry behind meant their promise never settled and the queue stalled. */
						setRunning(false);
						download.record.status = FileUploadRecordStatus.ERROR;
						download.error = error instanceof Error ? error : new Error(String(error));
						console.error('Download failed permanently:', record.id, error);
						/* Deliberately not called 'error': an EventEmitter with no 'error' listener rethrows
						 * the payload as an unhandled exception, and downloadAttachmentsSerial() uses this
						 * service without attaching one. */
						this.emit(DOWNLOAD_ERROR_EVENT, { uploadId: record.id, accountKey: download.accountKey, error: download.error });
						this.downloadStore.delete(scope);
						/* Do not leave the rest of the queue waiting on a transfer that will never finish. */
						setTimeout(() => this.startNextDownload(download));
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
					this.downloadStore.set(scope, download);
				};
				if (download.canceledLocally) {
					this.downloadStore.delete(scope);
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
					chunkHashes[expectedChunkId] = await this.verifyChunk(chunk, { record, expectedChunkId, offsetBytes, totalChunks });
					/* Index by the chunk id we asked for, never by the one the server echoed back:
					 * a hostile or buggy value would create a sparse array of arbitrary length. */
					download.chunksReceived[expectedChunkId] = chunk.data;
					retries = 0;
					this.downloadStore.set(scope, download);
					const totalReceived = download.chunksReceived.filter(c => c !== undefined).length;
					// Check if all chunks have been received
					if (totalReceived >= totalChunks) {
						const assembledSize = download.chunksReceived.reduce((sum: number, c: any) => sum + (c?.byteLength ?? c?.length ?? 0), 0);
						if (assembledSize !== record.fileSize) throw new Error(`Assembled file size ${assembledSize} does not match declared size ${record.fileSize}`);
						/* The whole file, not just its pieces: this pins content, order and chunk count
						 * against the digest the sender published. */
						if (expectedFileDigest) {
							const actualFileDigest = await fileDigestFromChunkHashes(chunkHashes);
							if (actualFileDigest !== expectedFileDigest) throw new Error('Assembled file does not match the digest the sender published');
						} else if (REQUIRE_CHUNK_CHECKSUMS) {
							throw new Error('The sender published no file digest');
						}
						setRunning(false);
						await finishCallback(download);
						download.chunksReceived = [];
						setTimeout(() => this.startNextDownload(download));
						this.downloadStore.delete(scope);
					} else {
						download.pullChunk && (await download.pullChunk());
					}
				} catch (e) {
					const totalReceived = download.chunksReceived.filter(c => c !== undefined).length;
					if (totalReceived >= totalChunks) {
						setRunning(false);
						this.downloadStore.delete(scope);
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

	/** Structural and cryptographic validation of a single chunk. Returns the chunk's hash. */
	private async verifyChunk(chunk: any, context: { record: IFileUploadRecord; expectedChunkId: number; offsetBytes: number; totalChunks: number }): Promise<string> {
		const { record, expectedChunkId, offsetBytes, totalChunks } = context;
		if (!chunk || !chunk.data) throw new Error('Empty chunk received');
		if (chunk.uploadId !== undefined && chunk.uploadId !== record.id) throw new Error('Chunk belongs to a different upload');
		if (chunk.chunkId !== undefined && chunk.chunkId !== expectedChunkId) throw new Error(`Unexpected chunk id ${chunk.chunkId}, expected ${expectedChunkId}`);
		if (chunk.offsetBytes !== undefined && chunk.offsetBytes !== offsetBytes) throw new Error(`Unexpected chunk offset ${chunk.offsetBytes}, expected ${offsetBytes}`);
		const isLastChunk = expectedChunkId === totalChunks - 1;
		const expectedLength = isLastChunk ? record.fileSize - offsetBytes : record.chunkSize;
		const actualLength = chunk.data.byteLength ?? chunk.data.length;
		if (actualLength !== expectedLength) throw new Error(`Chunk length ${actualLength} does not match expected ${expectedLength}`);
		const actual = await sha256Hex(chunk.data);
		const hasChecksum = typeof chunk.checksum === 'string' && chunk.checksum.length > 0;
		if (!hasChecksum) {
			/* Senders that predate per-chunk checksums send an empty string. */
			if (REQUIRE_CHUNK_CHECKSUMS) throw new Error('Chunk is missing its checksum');
			console.warn('Accepting a chunk without a checksum from an outdated sender:', record.id);
			return actual;
		}
		if (actual && actual !== chunk.checksum) throw new Error('Chunk checksum mismatch');
		return chunk.checksum;
	}

	async startDownload(download: IFileDownload): Promise<void> {
		/* Serialised per account, not globally: one account's large transfer used to block every other
		 * account's downloads for its whole duration. */
		if (this.downloadStore.isAnyDownloadRunning(download.accountKey)) return;
		download.pullChunk && (await download.pullChunk());
	}

	async startNextDownload(lastDownload: IFileDownload): Promise<void> {
		if (this.downloadStore.isAnyDownloadRunning(lastDownload.accountKey)) {
			return;
		}
		/* Only this account's queue moves on - see startDownload(). */
		const downloads = this.downloadStore.getAllForAccount(lastDownload.accountKey);
		let nextDownload: IFileDownload | undefined;
		/* Compare the owner as well - see startNextUpload(). */
		const lastDownloadIndex = downloads.findIndex(d => d.record.id === lastDownload.record.id && d.accountKey === lastDownload.accountKey);

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

	async pauseDownload(scope: ITransferScope | null): Promise<void> {
		const download = this.downloadStore.get(scope);
		if (download && scope) {
			download.pausedLocally = true;
			this.downloadStore.set(scope, download);
		}
	}

	async resumeDownload(scope: ITransferScope | null): Promise<void> {
		const download = this.downloadStore.get(scope);
		if (download && scope) {
			download.pausedLocally = false;
			this.downloadStore.set(scope, download);
		}
	}

	async cancelDownload(scope: ITransferScope | null): Promise<void> {
		const download = this.downloadStore.get(scope);
		if (download && scope) {
			download.canceledLocally = true;
			this.downloadStore.set(scope, download);
		}
	}
}

const fileDownloadManager = new FileDownloadService(fileDownloadStore);
export default fileDownloadManager;
