import { type IFileDownload, type FileDownloadStoreType, type IFileUploadRecord, FileUploadRecordStatus, type PullChunkFn } from './types.ts';
import { fileDigestFromChunkHashes, makeFileDownload, sha256Hex } from './utils.ts';
import { scopeAccountKey, type ITransferScope } from './accountScope.ts';
import EventEmitter from 'events';
import fileDownloadStore from '../../stores/FileDownloadStore.ts';

/** Retry pacing for transient chunk failures. Without a ceiling a dead transfer retries forever. */
const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 30_000;
const MAX_RETRIES = 8;
/* Failures that cannot possibly succeed on a retry: the data is wrong, not late. Retrying them let
 * a broken or hostile server hold a transfer for the whole backoff budget before it gave up. */
export class TransferIntegrityError extends Error {
	override name = 'TransferIntegrityError';
}

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

/** How long to wait for the sender's `upload_commit` before giving up on the digest. */
const DIGEST_WAIT_MS = 30_000;
const DIGEST_POLL_MS = 500;

/** Re-reads the transfer record from the server, used only while waiting for a digest. */
export type RefreshRecordFn = (uploadId: string) => Promise<IFileUploadRecord | null | undefined>;

export class FileDownloadService extends EventEmitter {
	downloadStore: FileDownloadStoreType;
	/* Overridable so tests do not have to sit through the real wait. */
	digestWaitMs = DIGEST_WAIT_MS;

	constructor(downloadStore: FileDownloadStoreType) {
		super();
		this.downloadStore = downloadStore;
	}

	async startDownloadSerial(records: IFileUploadRecord[], pullChunkFn: PullChunkFn, finishCallback: (download: IFileDownload) => void | Promise<void>, owner: ITransferScope | null, refreshRecordFn?: RefreshRecordFn): Promise<void> {
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
			/* Every terminal path goes through here: the record leaves the store, the failure is
			 * announced, and the account's queue moves on. Anything that only sets a status leaves the
			 * waiting FilesService promise unsettled forever. */
			const settleTerminally = (download: IFileDownload, error: Error): void => {
				download.running = false;
				download.record.status = FileUploadRecordStatus.ERROR;
				download.error = error;
				this.downloadStore.set(scope, download);
				console.error('Download failed permanently:', record.id, error);
				this.emit(DOWNLOAD_ERROR_EVENT, { uploadId: record.id, accountKey: download.accountKey, error });
				this.downloadStore.delete(scope);
				setTimeout(() => this.startNextDownload(download));
			};

			const totalChunks = Math.ceil(record.fileSize / record.chunkSize);
			/* Per-chunk hashes in arrival order, folded into the whole-file digest at the end. */
			const chunkHashes: string[] = [];
			let retries = 0;
			download.pullChunk = async () => {
				const retry = (error: unknown) => {
					const asError = error instanceof Error ? error : new Error(String(error));
					/* An integrity or protocol failure is deterministic - retrying it only wastes the
					 * backoff budget. */
					if (asError instanceof TransferIntegrityError || retries >= MAX_RETRIES) {
						settleTerminally(download, asError);
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
				/* An empty file has no chunks to fetch. Asking for chunk 0 anyway made a perfectly valid
				 * zero-byte transfer look corrupt. The sender already finishes these without sending. */
				if (totalChunks === 0) {
					try {
						await this.verifyFileDigest([], download, refreshRecordFn);
						setRunning(false);
						await finishCallback(download);
						download.chunksReceived = [];
						setTimeout(() => this.startNextDownload(download));
						this.downloadStore.delete(scope);
					} catch (e) {
						settleTerminally(download, e instanceof Error ? e : new Error(String(e)));
					}
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
					/* The server has declared this transfer dead. Settle it like any other terminal
					 * failure - just stopping here left the waiter hanging forever. */
					settleTerminally(download, new Error(`The server reported this transfer as ${download.record.status}`));
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
						if (assembledSize !== record.fileSize) throw new TransferIntegrityError(`Assembled file size ${assembledSize} does not match declared size ${record.fileSize}`);
						/* The whole file, not just its pieces: this pins content, order and chunk count
						 * against the digest the sender published. */
						await this.verifyFileDigest(chunkHashes, download, refreshRecordFn);
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

	/** The digest the sender published, read live - it can arrive after the download has started. */
	private publishedDigest(download: IFileDownload): string | null {
		const value = (download.record?.metadata as any)?.fileDigest;
		return typeof value === 'string' && value.length > 0 ? value : null;
	}

	/**
	 * Waits for the sender's `upload_commit` to land.
	 *
	 * The digest is published after the last chunk rather than before the first, so that the sender
	 * does not have to read the whole file twice. That puts the commit and the receiver's assembly in
	 * a genuine race - on a small file, or a P2P transfer where both sides run in lockstep, the
	 * receiver can finish first by a few milliseconds. Failing on the first look would turn that
	 * ordinary ordering into a refused transfer.
	 */
	private async awaitPublishedDigest(download: IFileDownload, refreshRecordFn?: RefreshRecordFn): Promise<string | null> {
		let digest = this.publishedDigest(download);
		if (digest || this.digestWaitMs <= 0) return digest;
		const deadline = Date.now() + this.digestWaitMs;
		while (!digest && Date.now() < deadline) {
			await new Promise(resolve => setTimeout(resolve, DIGEST_POLL_MS));
			if (download.canceledLocally) return null;
			/* An `upload_update` notification patches download.record in place, but relying on it alone
			 * would strand a receiver that was not connected when the commit went out. */
			if (refreshRecordFn) {
				try {
					const record = await refreshRecordFn(download.record.id);
					if (record) download.record = record;
				} catch (error) {
					console.warn('Could not re-read the transfer record while waiting for its digest:', error);
				}
			}
			digest = this.publishedDigest(download);
		}
		return digest;
	}

	/** Checks the assembled file against the digest the sender published. */
	private async verifyFileDigest(chunkHashes: string[], download: IFileDownload, refreshRecordFn?: RefreshRecordFn): Promise<void> {
		const expectedFileDigest = await this.awaitPublishedDigest(download, refreshRecordFn);
		if (!expectedFileDigest) {
			if (REQUIRE_CHUNK_CHECKSUMS) throw new TransferIntegrityError('The sender published no file digest');
			return;
		}
		const actual = await fileDigestFromChunkHashes(chunkHashes);
		if (actual !== expectedFileDigest) throw new TransferIntegrityError('Assembled file does not match the digest the sender published');
	}

	/** Structural and cryptographic validation of a single chunk. Returns the chunk's hash. */
	private async verifyChunk(chunk: any, context: { record: IFileUploadRecord; expectedChunkId: number; offsetBytes: number; totalChunks: number }): Promise<string> {
		const { record, expectedChunkId, offsetBytes, totalChunks } = context;
		if (!chunk || !chunk.data) throw new TransferIntegrityError('Empty chunk received');
		if (chunk.uploadId !== undefined && chunk.uploadId !== record.id) throw new TransferIntegrityError('Chunk belongs to a different upload');
		if (chunk.chunkId !== undefined && chunk.chunkId !== expectedChunkId) throw new TransferIntegrityError(`Unexpected chunk id ${chunk.chunkId}, expected ${expectedChunkId}`);
		if (chunk.offsetBytes !== undefined && chunk.offsetBytes !== offsetBytes) throw new TransferIntegrityError(`Unexpected chunk offset ${chunk.offsetBytes}, expected ${offsetBytes}`);
		const isLastChunk = expectedChunkId === totalChunks - 1;
		const expectedLength = isLastChunk ? record.fileSize - offsetBytes : record.chunkSize;
		const actualLength = chunk.data.byteLength ?? chunk.data.length;
		if (actualLength !== expectedLength) throw new TransferIntegrityError(`Chunk length ${actualLength} does not match expected ${expectedLength}`);
		const actual = await sha256Hex(chunk.data);
		const hasChecksum = typeof chunk.checksum === 'string' && chunk.checksum.length > 0;
		if (!hasChecksum) {
			/* Senders that predate per-chunk checksums send an empty string. */
			if (REQUIRE_CHUNK_CHECKSUMS) throw new TransferIntegrityError('Chunk is missing its checksum');
			console.warn('Accepting a chunk without a checksum from an outdated sender:', record.id);
			return actual;
		}
		if (actual && actual !== chunk.checksum) throw new TransferIntegrityError('Chunk checksum mismatch');
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
