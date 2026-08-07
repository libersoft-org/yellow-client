import { type ICustomFile, type IFileUpload, type IFileUploadBeginOptions, type IFileUploadRecord, FileUploadRecordStatus, FileUploadRecordType, FileUploadRole, type FileUploadStoreType, type IGetChunkResult } from './types.ts';
import { bytesToBase64, makeFileUpload, makeFileUploadRecord, sha256Hex } from './utils.ts';
import { accountScopeKey } from './accountScope.ts';
import EventEmitter from 'events';
import fileUploadStore from '../../stores/FileUploadStore.ts';

export class FileUploadService extends EventEmitter {
	uploadsStore: FileUploadStoreType;

	p2pThrottleMemory = new Map();
	p2pMaxBatchChunks = 10;
	/* One chunk in flight per upload. Pause/resume and the server's ask_for_chunk event can otherwise
	 * both enter the loop and compute the same next chunk id. */
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
			const upload = makeFileUpload({
				role: FileUploadRole.SENDER,
				file,
				record,
				acc,
				accountKey: accountScopeKey(acc),
			});
			this.uploadsStore.set(upload.record.id, upload);
			uploads.push(upload);
		}

		return { uploads };
	}

	async getChunk(uploadId: string, chunkId: number, chunkSize: number): Promise<IGetChunkResult> {
		const upload = this.uploadsStore.get(uploadId);
		if (!upload) throw new Error('Upload not found');
		if (!upload.file) throw new Error('File is not set in file transfer');
		const blob = upload.file.slice(chunkId * chunkSize, chunkId * chunkSize + chunkSize);
		/* Read the slice once and derive both the checksum and the wire encoding from it. */
		const bytes = new Uint8Array(await blob.arrayBuffer());
		const chunk = {
			chunkId,
			uploadId,
			/* Lets the receiver detect corruption, truncation and reordering. */
			checksum: await sha256Hex(bytes),
			data: bytesToBase64(bytes),
		};
		return { chunk, upload, blob };
	}

	async startUploadSerial(records: IFileUploadRecord[], pushFn: (data: { chunk: any; upload: IFileUpload }) => Promise<void>): Promise<void> {
		for (let i = 0; i < records.length; i++) {
			const record = records[i]!;
			const upload = this.uploadsStore.get(record.id);
			if (!upload) continue;
			if (!upload.file) continue;
			const { chunksSent } = upload;
			const { chunkSize } = upload.record;
			const totalChunks = Math.ceil(record.fileSize / chunkSize);
			upload.pushChunk = async () => {
				const setRunning = (running: boolean) => {
					upload.running = running;
					this.uploadsStore.set(record.id, upload);
				};
				/* Reentrancy guard: only one chunk loop per upload may run at a time. Without it,
				 * resume/ask_for_chunk can start a second loop that computes the same next chunk id. */
				if (this.inFlight.has(record.id)) return;
				this.inFlight.add(record.id);
				setRunning(true);
				try {
					/* A loop rather than recursion, so `running` stays true for the whole run and the
					 * serial queue cannot start another upload in between two chunks. */
					for (;;) {
						if (upload.record.status === FileUploadRecordStatus.CANCELED || upload.record.status === FileUploadRecordStatus.ERROR) {
							upload.pushChunk = undefined;
							this.p2pThrottleMemory.delete(record.id);
							return;
						}
						if (upload.record.status === FileUploadRecordStatus.PAUSED) return;
						if (chunksSent.length === totalChunks) {
							upload.record.status = FileUploadRecordStatus.FINISHED;
							this.uploadsStore.set(record.id, upload);
							this.p2pThrottleMemory.delete(record.id);
							setTimeout(() => this.startNextUpload(upload));
							return;
						}
						if (record.type === FileUploadRecordType.P2P && this.p2pThrottleMemory.get(record.id) >= this.p2pMaxBatchChunks) return;
						const lastChunkId = chunksSent[chunksSent.length - 1];
						const newChunkId = lastChunkId === undefined ? 0 : lastChunkId + 1;
						const { chunk } = await this.getChunk(upload.record.id, newChunkId, chunkSize);
						await pushFn({ chunk, upload });
						chunksSent[newChunkId] = newChunkId;
						this.uploadsStore.set(record.id, upload);
						if (record.type === FileUploadRecordType.P2P) {
							const throttleMemory = this.p2pThrottleMemory.get(record.id) || 0;
							this.p2pThrottleMemory.set(record.id, throttleMemory + 1);
						}
					}
				} catch (e) {
					/* Without this the upload would stay marked as running forever and wedge the serial
					 * queue, because isAnyUploadRunning() would never go back to false. */
					upload.record.status = FileUploadRecordStatus.ERROR;
					this.uploadsStore.set(record.id, upload);
					console.error('Upload chunk failed:', record.id, e);
					throw e;
				} finally {
					this.inFlight.delete(record.id);
					setRunning(false);
				}
			};
			this.uploadsStore.set(record.id, upload);
			await this.startUpload(upload);
		}
	}

	async startUpload(upload: IFileUpload): Promise<void> {
		if (this.uploadsStore.isAnyUploadRunning()) return;
		upload.pushChunk && (await upload.pushChunk());
	}

	async startNextUpload(lastUpload: IFileUpload): Promise<void> {
		const uploads = this.uploadsStore.getAll();
		const lastUploadIndex = uploads.findIndex(upload => upload.record.id === lastUpload.record.id);
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

	async continueP2PUpload(uploadId: string): Promise<void> {
		// proceed to next batch
		const upload = this.uploadsStore.get(uploadId);
		if (!upload) return;
		if (!upload.file) return;
		// reset throttle memory
		this.p2pThrottleMemory.set(uploadId, 0);
		if (upload.pushChunk && !this.inFlight.has(uploadId)) await upload.pushChunk();
	}

	pauseUpload(uploadId: string): void {
		const upload = this.uploadsStore.get(uploadId);
		if (!upload) return;
		upload.record.status = FileUploadRecordStatus.PAUSED;
		this.uploadsStore.set(uploadId, upload);
	}

	resumeUpload(uploadId: string): void {
		const upload = this.uploadsStore.get(uploadId);
		if (!upload) return;
		upload.record.status = FileUploadRecordStatus.UPLOADING;
		this.uploadsStore.set(uploadId, upload);
		/* Never start a second chunk loop while one is still running. */
		if (upload.pushChunk && !this.inFlight.has(uploadId)) void upload.pushChunk();
	}

	cancelUpload(uploadId: string): void {
		const upload = this.uploadsStore.get(uploadId);
		if (!upload) return;
		upload.record.status = FileUploadRecordStatus.CANCELED;
		this.uploadsStore.set(uploadId, upload);
	}
}

const fileUploadManager = new FileUploadService(fileUploadStore);
export default fileUploadManager;
