import { FileUploadRecordStatus, FileUploadRecordType, FileUploadRole, type FileUploadStoreType, type ICustomFile, type IFileUpload, type IFileUploadBeginOptions, type PushChunkFnType } from './types.ts';
import { blobToBase64, makeFileUpload, makeFileUploadRecord } from './utils.ts';
import EventEmitter from 'events';
import fileUploadStore from '../../stores/FileUploadStore.ts';
import { call, exit, run } from 'effection';

export class FileUploadService extends EventEmitter {
	uploadsStore: FileUploadStoreType;

	p2pThrottleMemory = new Map();
	p2pMaxBatchChunks = 10;

	constructor(uploadsStore: FileUploadStoreType) {
		super();

		this.uploadsStore = uploadsStore;
	}

	initUploads(files: FileList, type: FileUploadRecordType, acc, pushFn: PushChunkFnType, options: IFileUploadBeginOptions) {
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
				pushFn,
			});
			this.uploadsStore.set(upload.record.id, upload);
			uploads.push(upload);
		}

		return { uploads };
	}

	async getChunk(uploadId: string, chunkId: number, chunkSize: number) {
		const upload = this.uploadsStore.get(uploadId);

		if (!upload) {
			throw new Error('Upload not found');
		}
		if (!upload.file) {
			throw new Error('File is not set in file transfer');
		}

		const blob = upload.file.slice(chunkId * chunkSize, chunkId * chunkSize + chunkSize);

		const chunk = {
			chunkId,
			uploadId,
			checksum: '',
			data: await blobToBase64(blob),
		};

		return { chunk, upload, blob };
	}

	startUpload(upload: IFileUpload) {
		const self = this;
		const { chunksSent } = upload;
		const { chunkSize } = upload.record;
		const record = upload.record;

		if (!upload) {
			return; // todo: throw
		}
		if (!upload.file) {
			return; // todo: throw
		}

		function* pushNextChunk() {
			const lastChunkId = chunksSent[chunksSent.length - 1];
			const newChunkId = lastChunkId === undefined ? 0 : lastChunkId + 1;
			const { chunk } = yield* call(() => self.getChunk(upload.record.id, newChunkId, chunkSize));
			console.log('chunksSent 111', chunksSent);

			if (!upload.pushFn) {
				yield* exit(1, 'Upload push function is not defined');
			}

			// @ts-ignore
			yield* call(() => upload.pushFn({ chunk, upload }));
			chunksSent[newChunkId] = newChunkId;
			self.uploadsStore.set(record.id, upload);
			console.log('chunksSent 222', chunksSent);

			if (record.type === FileUploadRecordType.P2P) {
				const throttleMemory = self.p2pThrottleMemory.get(record.id) || 0;
				self.p2pThrottleMemory.set(record.id, throttleMemory + 1);
			}
		}

		return run(function* () {
			try {
				while (true) {
					if (upload.record.status === FileUploadRecordStatus.CANCELED || upload.record.status === FileUploadRecordStatus.ERROR || upload.record.status === FileUploadRecordStatus.PAUSED) {
						break;
					}
					if (chunksSent.length === Math.ceil(upload.record.fileSize / chunkSize)) {
						upload.record.status = FileUploadRecordStatus.FINISHED;
						self.uploadsStore.set(upload.record.id, upload);
						break;
					}
					if (upload.record.type === FileUploadRecordType.P2P && self.p2pThrottleMemory.get(upload.record.id) >= self.p2pMaxBatchChunks) {
						//break;
					}

					if (!upload.running) {
						upload.running = true;
						self.uploadsStore.set(upload.record.id, upload);
					}

					yield* pushNextChunk();
				}
			} catch (err) {
				console.log('AAAAA', err);
			} finally {
				console.log('BBBBBBBBB finish');
				// finish after exit was yielded
				upload.running = false;
				self.uploadsStore.set(upload.record.id, upload);
				if (record.status === FileUploadRecordStatus.FINISHED) {
					self.startNextUpload(upload);
				}
			}
		});
	}

	async startNextUpload(lastUpload: IFileUpload) {
		if (this.uploadsStore.isAnyUploadRunning()) {
			return;
		}
		const uploads = this.uploadsStore.getAll();
		const lastUploadIndex = uploads.findIndex(upload => upload.record.id === lastUpload.record.id);
		let nextUpload: IFileUpload | undefined;

		// find next suitable upload
		for (let i = lastUploadIndex + 1; i < uploads.length; i++) {
			const upload = uploads[i];
			if (upload.file && upload.record.type === FileUploadRecordType.SERVER && upload.record.status === FileUploadRecordStatus.BEGUN) {
				nextUpload = upload;
				break;
			}
		}

		if (nextUpload) {
			await this.startUpload(nextUpload);
		}
	}

	async continueP2PUpload(upload: IFileUpload) {
		if (!upload.file) {
			return;
		}
		// reset throttle memory
		this.p2pThrottleMemory.set(upload.record.id, 0);
		//upload.pushChunk && !upload.running && (await upload.pushChunk());
		if (!upload.running) {
			await this.startUpload(upload);
		}
	}

	pauseUpload(uploadId: string) {
		const upload = this.uploadsStore.get(uploadId);

		if (!upload) {
			return;
		}

		upload.record.status = FileUploadRecordStatus.PAUSED;
		this.uploadsStore.set(uploadId, upload);
	}

	resumeUpload(uploadId: string) {
		const upload = this.uploadsStore.get(uploadId);

		if (!upload) {
			return;
		}

		upload.record.status = FileUploadRecordStatus.UPLOADING;
		this.uploadsStore.set(uploadId, upload);
		this.startUpload(upload);
	}

	cancelUpload(uploadId: string) {
		const upload = this.uploadsStore.get(uploadId);

		if (!upload) {
			return;
		}

		upload.record.status = FileUploadRecordStatus.CANCELED;
		this.uploadsStore.set(uploadId, upload);
	}
}

const fileUploadManager = new FileUploadService(fileUploadStore);
export default fileUploadManager;
