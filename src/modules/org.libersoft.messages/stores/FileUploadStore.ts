import { get, writable } from 'svelte/store';
import { type IFileUpload, type IFileUploadRecord, FileUploadRecordStatus, type FileUploadStoreType, type FileUploadStoreValue } from '@/org.libersoft.messages/services/Files/types.ts';
import { scopeAccountKey, type ITransferScope } from '@/org.libersoft.messages/services/Files/accountScope.ts';

export let windowFileUploadStore = writable<any>(null);

/* See FileDownloadStore: transfers are addressed by an explicit scope captured at creation. */
function matches(upload: IFileUpload, scope: ITransferScope): boolean {
	return upload.record.id === scope.uploadId && upload.accountKey === scopeAccountKey(scope);
}

export class FileUploadStore implements FileUploadStoreType {
	store = writable<FileUploadStoreValue>([]);

	/** Every upload, regardless of owner - used by the serial queue. */
	getAll(): FileUploadStoreValue {
		return get(this.store);
	}

	/** Uploads owned by one account. */
	getAllForAccount(accountKey: string): FileUploadStoreValue {
		return get(this.store).filter(upload => upload.accountKey === accountKey);
	}

	get(scope: ITransferScope | null): IFileUpload | undefined {
		if (!scope) return undefined;
		return get(this.store).find(upload => matches(upload, scope));
	}

	set(scope: ITransferScope, upload: IFileUpload): void {
		this.store.update(store => {
			const index = store.findIndex(u => matches(u, scope));
			if (index !== -1) {
				store[index] = upload;
			} else {
				store.push(upload);
			}
			return [...store];
		});
	}

	patch(scope: ITransferScope, data: Partial<IFileUpload>): void {
		// patch but dont change ref
		this.store.update(store => {
			const oldUpload = store.find(upload => matches(upload, scope));
			if (!oldUpload) {
				return store;
			}

			for (const key in data) {
				oldUpload[key] = data[key];
			}

			return [...store];
		});
	}

	delete(scope: ITransferScope): void {
		this.store.update(store => store.filter(upload => !matches(upload, scope)));
	}

	updateUploadRecord(scope: ITransferScope, record: IFileUploadRecord): void {
		this.patch(scope, { record });
	}

	isAnyUploadRunning(): boolean {
		return get(this.store).some(upload => upload && [FileUploadRecordStatus.UPLOADING, FileUploadRecordStatus.BEGUN].includes(upload.record.status) && upload.file && upload.running);
	}
}

const fileUploadStore = new FileUploadStore();
export default fileUploadStore;
