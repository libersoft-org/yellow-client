import { get, writable } from 'svelte/store';
import type { IFileDownload, FileDownloadStoreType, FileDownloadStoreValue, IFileUploadRecord } from '@/org.libersoft.messages/services/Files/types.ts';
import { scopeAccountKey, type ITransferScope } from '@/org.libersoft.messages/services/Files/accountScope.ts';

/* Entries are addressed by an explicit transfer scope, never by upload id alone: the id is unique
 * per server only, and the account that owns a running transfer is not necessarily the one that is
 * in the foreground when someone looks it up. */
function matches(download: IFileDownload, scope: ITransferScope): boolean {
	return download.record.id === scope.uploadId && download.accountKey === scopeAccountKey(scope);
}

export class FileDownloadStore implements FileDownloadStoreType {
	store = writable<FileDownloadStoreValue>([]);

	/** Every download, regardless of owner - used by the serial queue. */
	getAll(): FileDownloadStoreValue {
		return get(this.store);
	}

	/** Downloads owned by one account. */
	getAllForAccount(accountKey: string): FileDownloadStoreValue {
		return get(this.store).filter(download => download.accountKey === accountKey);
	}

	get(scope: ITransferScope | null): IFileDownload | undefined {
		if (!scope) return undefined;
		return get(this.store).find(download => matches(download, scope));
	}

	set(scope: ITransferScope, download: IFileDownload): void {
		this.store.update(store => {
			const index = store.findIndex(d => matches(d, scope));
			if (index !== -1) store[index] = download;
			else store.push(download);
			return [...store];
		});
	}

	patch(scope: ITransferScope, data: Partial<IFileDownload>): void {
		// patch but dont change ref
		this.store.update(store => {
			const oldDownload = store.find(download => matches(download, scope));
			if (!oldDownload) return store;
			for (const key in data) {
				oldDownload[key] = data[key];
			}
			return [...store];
		});
	}

	delete(scope: ITransferScope): void {
		this.store.update(store => store.filter(download => !matches(download, scope)));
	}

	updateDownloadRecord(scope: ITransferScope, record: IFileUploadRecord): void {
		this.patch(scope, { record });
	}

	/** Whether a download is running, optionally limited to one account's queue. */
	isAnyDownloadRunning(accountKey?: string): boolean {
		return get(this.store).some(download => download.running && (accountKey === undefined || download.accountKey === accountKey));
	}
}

const fileDownloadStore = new FileDownloadStore();
export default fileDownloadStore;
