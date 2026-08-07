import { get, writable } from 'svelte/store';
import type { IFileDownload, FileDownloadStoreType, FileDownloadStoreValue, IFileUploadRecord } from '@/org.libersoft.messages/services/Files/types.ts';
import { activeAccountScopeKey } from '@/org.libersoft.messages/services/Files/accountScope.ts';

/* Entries are addressed by upload id, which is only unique per server, so every lookup is also
 * matched against the owning account scope. Entries created before an account scope was known
 * (accountKey == null) stay reachable so that nothing silently disappears. */
function matches(download: IFileDownload, id: string, scopeKey: string | null): boolean {
	if (download.record.id !== id) return false;
	if (download.accountKey == null) return true;
	return download.accountKey === scopeKey;
}

export class FileDownloadStore implements FileDownloadStoreType {
	store = writable<FileDownloadStoreValue>([]);

	getAll(): FileDownloadStoreValue {
		const scopeKey = activeAccountScopeKey();
		return get(this.store).filter(download => download.accountKey == null || download.accountKey === scopeKey);
	}

	get(id: string): IFileDownload | undefined {
		const scopeKey = activeAccountScopeKey();
		return get(this.store).find(download => matches(download, id, scopeKey));
	}

	set(id: string, download: IFileDownload): void {
		const scopeKey = activeAccountScopeKey();
		this.store.update(store => {
			const index = store.findIndex(d => matches(d, id, download.accountKey ?? scopeKey));
			if (index !== -1) store[index] = download;
			else store.push(download);
			return [...store];
		});
	}

	patch(id: string, data: Partial<IFileDownload>): void {
		const scopeKey = activeAccountScopeKey();
		// patch but dont change ref
		this.store.update(store => {
			const oldDownload = store.find(download => matches(download, id, scopeKey));
			if (!oldDownload) return store;
			for (const key in data) {
				oldDownload[key] = data[key];
			}
			return [...store];
		});
	}

	delete(id: string): void {
		const scopeKey = activeAccountScopeKey();
		this.store.update(store => store.filter(download => !matches(download, id, scopeKey)));
	}

	updateDownloadRecord(id: string, record: IFileUploadRecord): void {
		this.patch(id, { record });
	}

	isAnyDownloadRunning(): boolean {
		return get(this.store).some(download => download.running);
	}
}

const fileDownloadStore = new FileDownloadStore();
export default fileDownloadStore;
