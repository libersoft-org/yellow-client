import { get, writable } from 'svelte/store';
import { type IFileUpload, type IFileUploadRecord, FileUploadRecordStatus, type FileUploadStoreType, type FileUploadStoreValue } from '@/org.libersoft.messages/services/Files/types.ts';
import { activeAccountScopeKey } from '@/org.libersoft.messages/services/Files/accountScope.ts';

export let windowFileUploadStore = writable<any>(null);

/* See FileDownloadStore: upload ids are unique per server only, so lookups are scoped by account. */
function matches(upload: IFileUpload, id: string, scopeKey: string | null): boolean {
	if (upload.record.id !== id) return false;
	if (upload.accountKey == null) return true;
	return upload.accountKey === scopeKey;
}

export class FileUploadStore implements FileUploadStoreType {
	store = writable<FileUploadStoreValue>([]);

	getAll(): FileUploadStoreValue {
		const scopeKey = activeAccountScopeKey();
		return get(this.store).filter(upload => upload.accountKey == null || upload.accountKey === scopeKey);
	}

	get(id: string): IFileUpload | undefined {
		const scopeKey = activeAccountScopeKey();
		return get(this.store).find(upload => matches(upload, id, scopeKey));
	}

	set(id: string, upload: IFileUpload): void {
		const scopeKey = activeAccountScopeKey();
		this.store.update(store => {
			const index = store.findIndex(u => matches(u, id, upload.accountKey ?? scopeKey));
			if (index !== -1) {
				store[index] = upload;
			} else {
				store.push(upload);
			}
			return [...store];
		});
	}

	patch(id: string, data: Partial<IFileUpload>): void {
		const scopeKey = activeAccountScopeKey();
		// patch but dont change ref
		this.store.update(store => {
			const oldUpload = store.find(upload => matches(upload, id, scopeKey));
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
		const scopeKey = activeAccountScopeKey();
		this.store.update(store => store.filter(upload => !matches(upload, id, scopeKey)));
	}

	updateUploadRecord(id: string, record: IFileUploadRecord): void {
		this.patch(id, { record });
	}

	isAnyUploadRunning(): boolean {
		return get(this.store).some(upload => upload && [FileUploadRecordStatus.UPLOADING, FileUploadRecordStatus.BEGUN].includes(upload.record.status) && upload.file && upload.running);
	}
}

const fileUploadStore = new FileUploadStore();
export default fileUploadStore;
