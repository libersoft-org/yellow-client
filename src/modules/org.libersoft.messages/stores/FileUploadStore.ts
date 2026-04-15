import { get, writable } from 'svelte/store';
import { type IFileUpload, type IFileUploadRecord, FileUploadRecordStatus, type FileUploadStoreType, type FileUploadStoreValue } from '@/org.libersoft.messages/services/Files/types.ts';

export let windowFileUploadStore = writable<any>(null);

export class FileUploadStore implements FileUploadStoreType {
	store = writable<FileUploadStoreValue>([]);

	getAll(): FileUploadStoreValue {
		return get(this.store);
	}

	get(id: string): IFileUpload | undefined {
		return get(this.store).find(upload => upload.record.id === id);
	}

	set(id: string, upload: IFileUpload): void {
		this.store.update(store => {
			const index = store.findIndex(d => d.record.id === id);
			if (index !== -1) {
				store[index] = upload;
			} else {
				store.push(upload);
			}
			return [...store];
		});
	}

	patch(id: string, data: Partial<IFileUpload>): void {
		// patch but dont change ref
		this.store.update(store => {
			const oldUpload = store.find(upload => upload.record.id === id);
			if (!oldUpload) {
				return store;
			}

			for (const key in data) {
				oldUpload[key] = data[key];
			}

			return [...store];
		});
	}

	delete(id: string): void {
		this.store.update(store => store.filter(upload => upload.record.id !== id));
	}

	updateUploadRecord(id: string, record: IFileUploadRecord): void {
		this.patch(id, { record });
	}

	isAnyUploadRunning(): boolean {
		return this.getAll().some(upload => upload && [FileUploadRecordStatus.UPLOADING, FileUploadRecordStatus.BEGUN].includes(upload.record.status) && upload.file && upload.running);
	}
}

const fileUploadStore = new FileUploadStore();
export default fileUploadStore;
