import { type ICustomFile, type IFileUpload, type IFileUploadBeginOptions, type IFileUploadRecord, FileUploadRecordStatus, FileUploadRecordType, FileUploadRole, type FileUploadStoreType, type IGetChunkResult } from './types.ts';
import { bytesToBase64, fileDigestFromChunkHashes, makeFileUpload, makeFileUploadRecord, sha256Hex } from './utils.ts';
import { accountScopeKey, scopeKey, type ITransferScope } from './accountScope.ts';
import EventEmitter from 'events';
import fileUploadStore from '../../stores/FileUploadStore.ts';

export class FileUploadService extends EventEmitter {
	uploadsStore: FileUploadStoreType;

	/* Keyed by the full transfer scope, like the in-flight guard below: two accounts can hold the
	 * same upload id, and a shared key made them throttle each other. */
	p2pThrottleMemory = new Map<string, number>();
	p2pMaxBatchChunks = 10;
	/* One chunk in flight per upload, keyed by the full transfer scope: two accounts can hold the
	 * same upload id, and a shared key would let one of them suppress the other's chunk loop. */
	private inFlight = new Set<string>();

	constructor(uploadsStore: FileUploadStoreType) {
		super();

		this.uploadsStore = uploadsStore;
	}

	beginUpload(files: FileList, type: FileUploadRecordType, acc, options: IFileUploadBeginOptions): { uploads: IFileUpload[] } {
		const uploads: IFileUpload[] = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i] as ICustomFile;
			const record = makeFileUploadRecord({
				type,
				fileOriginalName: file.name,
				fileMimeType: file.type,
				fileSize: file.size,
				chunkSize: options?.chunkSize || 1024 * 64,
				fromUserUid: acc.id,
				metadata: file.metadata,
			});
			/* The whole-file digest is computed while the chunks are read and published in the record's
			 * metadata, which the server round-trips untouched (the same path video thumbnails use). */
			const accountKey = accountScopeKey(acc);
			if (!accountKey) throw new Error('Cannot begin an upload without an account');
			const upload = makeFileUpload({
				role: FileUploadRole.SENDER,
				file,
				record,
				acc,
				accountKey,
			});
			this.uploadsStore.set({ accountId: acc.id, server: acc.credentials?.server ?? '', uploadId: record.id }, upload);
			uploads.push(upload);
		}

		return { uploads };
	}

	async getChunk(scope: ITransferScope, chunkId: number, chunkSize: number): Promise<IGetChunkResult> {
		const uploadId = scope.uploadId;
		const upload = this.uploadsStore.get(scope);
		if (!upload) throw new Error('Upload not found');
		if (!upload.file) throw new Error('File is not set in file transfer');
		const blob = upload.file.slice(chunkId * chunkSize, chunkId * chunkSize + chunkSize);
		/* Read the slice once and derive both the checksum and the wire encoding from it. */
		const bytes = new Uint8Array(await blob.arrayBuffer());
		const checksum = await sha256Hex(bytes);
		const chunk = {
			chunkId,
			uploadId,
			/* Lets the receiver detect corruption, truncation and reordering. */
			checksum,
			data: bytesToBase64(bytes),
		};
		return { chunk, upload, blob };
	}

	/** Hashes the whole file so the receiver can verify the assembled result, not just each chunk. */
	async computeFileDigest(upload: IFileUpload): Promise<string> {
		if (!upload.file) throw new Error('File is not set in file transfer');
		const { chunkSize, fileSize } = upload.record;
		const total = Math.ceil(fileSize / chunkSize);
		const hashes: string[] = [];
		for (let i = 0; i < total; i++) {
			const slice = upload.file.slice(i * chunkSize, i * chunkSize + chunkSize);
			hashes.push(await sha256Hex(new Uint8Array(await slice.arrayBuffer())));
		}
		return fileDigestFromChunkHashes(hashes);
	}

	async startUploadSerial(records: IFileUploadRecord[], pushFn: (data: { chunk: any; upload: IFileUpload }) => Promise<void>, owner: ITransferScope | null): Promise<void> {
		if (!owner) throw new Error('Cannot upload without an owning account');
		for (let i = 0; i < records.length; i++) {
			const record = records[i]!;
			/* Fixed for the lifetime of this transfer. */
			const scope: ITransferScope = { accountId: owner.accountId, server: owner.server, uploadId: record.id };
			const guardKey = scopeKey(scope);
			const upload = this.uploadsStore.get(scope);
			if (!upload) continue;
			if (!upload.file) continue;
			const { chunksSent } = upload;
			const { chunkSize } = upload.record;
			const totalChunks = Math.ceil(record.fileSize / chunkSize);
			upload.pushChunk = async () => {
				const setRunning = (running: boolean) => {
					upload.running = running;
					this.uploadsStore.set(scope, upload);
				};
				/* Reentrancy guard: only one chunk loop per upload may run at a time. Without it,
				 * resume/ask_for_chunk can start a second loop that computes the same next chunk id. */
				if (this.inFlight.has(guardKey)) return;
				this.inFlight.add(guardKey);
				setRunning(true);
				try {
					/* A loop rather than recursion, so `running` stays true for the whole run and the
					 * serial queue cannot start another upload in between two chunks. */
					for (;;) {
						if (upload.record.status === FileUploadRecordStatus.CANCELED || upload.record.status === FileUploadRecordStatus.ERROR) {
							upload.pushChunk = undefined;
							this.p2pThrottleMemory.delete(guardKey);
							return;
						}
						if (upload.record.status === FileUploadRecordStatus.PAUSED) return;
						if (chunksSent.length === totalChunks) {
							upload.record.status = FileUploadRecordStatus.FINISHED;
							this.uploadsStore.set(scope, upload);
							this.p2pThrottleMemory.delete(guardKey);
							setTimeout(() => this.startNextUpload(upload));
							return;
						}
						if (record.type === FileUploadRecordType.P2P && (this.p2pThrottleMemory.get(guardKey) ?? 0) >= this.p2pMaxBatchChunks) return;
						const lastChunkId = chunksSent[chunksSent.length - 1];
						const newChunkId = lastChunkId === undefined ? 0 : lastChunkId + 1;
						const { chunk } = await this.getChunk(scope, newChunkId, chunkSize);
						await pushFn({ chunk, upload });
						chunksSent[newChunkId] = newChunkId;
						this.uploadsStore.set(scope, upload);
						if (record.type === FileUploadRecordType.P2P) {
							const throttleMemory = this.p2pThrottleMemory.get(guardKey) || 0;
							this.p2pThrottleMemory.set(guardKey, throttleMemory + 1);
						}
					}
				} catch (e) {
					/* Without this the upload would stay marked as running forever and wedge the serial
					 * queue, because isAnyUploadRunning() would never go back to false. */
					upload.record.status = FileUploadRecordStatus.ERROR;
					this.uploadsStore.set(scope, upload);
					console.error('Upload chunk failed:', record.id, e);
					throw e;
				} finally {
					this.inFlight.delete(guardKey);
					setRunning(false);
				}
			};
			this.uploadsStore.set(scope, upload);
			await this.startUpload(upload);
		}
	}

	async startUpload(upload: IFileUpload): Promise<void> {
		/* Serialised per account - see FileDownloadService.startDownload(). */
		if (this.uploadsStore.isAnyUploadRunning(upload.accountKey)) return;
		upload.pushChunk && (await upload.pushChunk());
	}

	async startNextUpload(lastUpload: IFileUpload): Promise<void> {
		/* Only this account's queue moves on. */
		const uploads = this.uploadsStore.getAllForAccount(lastUpload.accountKey);
		/* Compare the owner as well: with two accounts holding the same upload id, matching on the id
		 * alone can land on the wrong entry and skip a transfer. */
		const lastUploadIndex = uploads.findIndex(upload => upload.record.id === lastUpload.record.id && upload.accountKey === lastUpload.accountKey);
		let nextUpload: IFileUpload | undefined;
		// find next suitable upload
		for (let i = lastUploadIndex + 1; i < uploads.length; i++) {
			const upload = uploads[i]!;
			if (upload.record.type === FileUploadRecordType.SERVER && upload.record.status === FileUploadRecordStatus.BEGUN) {
				nextUpload = upload;
				break;
			}
		}
		if (nextUpload) await this.startUpload(nextUpload);
	}

	async continueP2PUpload(scope: ITransferScope | null): Promise<void> {
		// proceed to next batch
		const upload = this.uploadsStore.get(scope);
		if (!upload || !scope) return;
		if (!upload.file) return;
		// reset throttle memory
		this.p2pThrottleMemory.set(scopeKey(scope), 0);
		if (upload.pushChunk && !this.inFlight.has(scopeKey(scope))) await upload.pushChunk();
	}

	pauseUpload(scope: ITransferScope | null): void {
		const upload = this.uploadsStore.get(scope);
		if (!upload || !scope) return;
		upload.record.status = FileUploadRecordStatus.PAUSED;
		this.uploadsStore.set(scope, upload);
	}

	resumeUpload(scope: ITransferScope | null): void {
		const upload = this.uploadsStore.get(scope);
		if (!upload || !scope) return;
		upload.record.status = FileUploadRecordStatus.UPLOADING;
		this.uploadsStore.set(scope, upload);
		/* Never start a second chunk loop while one is still running. */
		if (upload.pushChunk && !this.inFlight.has(scopeKey(scope))) void upload.pushChunk();
	}

	cancelUpload(scope: ITransferScope | null): void {
		const upload = this.uploadsStore.get(scope);
		if (!upload || !scope) return;
		upload.record.status = FileUploadRecordStatus.CANCELED;
		this.uploadsStore.set(scope, upload);
	}
}

const fileUploadManager = new FileUploadService(fileUploadStore);
export default fileUploadManager;
