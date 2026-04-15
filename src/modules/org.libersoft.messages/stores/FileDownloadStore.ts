import { get, writable } from 'svelte/store';
import type { IFileDownload, FileDownloadStoreType, FileDownloadStoreValue, IFileUploadRecord } from '@/org.libersoft.messages/services/Files/types.ts';

export class FileDownloadStore implements FileDownloadStoreType {
	store = writable<FileDownloadStoreValue>([]);

	getAll(): FileDownloadStoreValue {
		return get(this.store);
	}

	get(id: string): IFileDownload | undefined {
		return get(this.store).find(download => download.record.id === id);
	}

	set(id: string, download: IFileDownload): void {
		this.store.update(store => {
			const index = store.findIndex(d => d.record.id === id);
			if (index !== -1) store[index] = download;
			else store.push(download);
			return [...store];
		});
	}

	patch(id: string, data: Partial<IFileDownload>): void {
		// patch but dont change ref
		this.store.update(store => {
			const oldDownload = store.find(download => download.record.id === id);
			if (!oldDownload) return store;
			for (const key in data) {
				oldDownload[key] = data[key];
			}
			return [...store];
		});
	}

	delete(id: string): void {
		this.store.update(store => store.filter(download => download.record.id !== id));
	}

	updateDownloadRecord(id: string, record: IFileUploadRecord): void {
		this.patch(id, { record });
	}

	isAnyDownloadRunning(): boolean {
		return this.getAll().some(download => download.running);
	}
}

const fileDownloadStore = new FileDownloadStore();
export default fileDownloadStore;
