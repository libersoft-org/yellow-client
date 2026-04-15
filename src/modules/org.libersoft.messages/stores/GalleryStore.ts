import { get, writable, derived, type Readable } from 'svelte/store';
//import filesService from '@/org.libersoft.messages/services/Files/FilesService.ts';
//import { LocalFileStatus } from '@/org.libersoft.messages/services/LocalDB/FilesLocalDB.ts';

export interface IGalleryFile {
	id: string | number;
	loaded: boolean;
	url?: string | undefined;
	fileName?: string | undefined;
	alt?: string | undefined; // fallbacks to fileName
	// fileMimeType: string;
	loadFile?: (() => Promise<Omit<IGalleryFile, 'loadFile'>>) | undefined;
}

export interface IGalleryStoreValue {
	show: boolean;
	files: IGalleryFile[];
	currentId: IGalleryFile['id'] | null;
}

export class GalleryStore {
	store = writable<IGalleryStoreValue>({
		show: false,
		files: [],
		currentId: null,
	});

	value(): IGalleryStoreValue {
		return get(this.store);
	}

	setShow(show: boolean): void {
		this.store.update(store => {
			store.show = show;
			return store;
		});
	}

	setFiles(files: IGalleryFile[]): void {
		this.store.update(store => {
			store.files = files;
			return store;
		});
	}

	updateFile(id: IGalleryFile['id'], file: Omit<IGalleryFile, 'id'>): void {
		this.store.update(store => {
			const index = store.files.findIndex(f => f.id === id);
			if (index === -1) {
				return store;
			}
			store.files[index] = {
				...store.files[index]!,
				...file,
			};
			return store;
		});
	}

	setCurrentId(currentIndex: number): void {
		this.store.update(store => {
			store.currentId = currentIndex;
			return store;
		});
	}

	getFile(id: IGalleryFile['id']): IGalleryFile | undefined {
		return get(this.store).files.find(file => file.id === id);
	}

	currentFile(): Readable<IGalleryFile | null | undefined> {
		return derived(this.store, $store => {
			if ($store.currentId === null) {
				return null;
			}
			return $store.files.find(file => file.id === $store.currentId);
		});
	}

	previous(): void {
		this.store.update(store => {
			if (store.currentId === null) {
				return store;
			}
			const currentIndex = store.files.findIndex(file => file.id === store.currentId);
			const nextIndex = currentIndex - 1;
			if (nextIndex < 0) {
				return store;
			}
			store.currentId = store.files[nextIndex]!.id;
			return store;
		});
	}

	next(): void {
		this.store.update(store => {
			if (store.currentId === null) return store;
			const currentIndex = store.files.findIndex(file => file.id === store.currentId);
			const nextIndex = currentIndex + 1;
			if (nextIndex >= store.files.length) return store;
			store.currentId = store.files[nextIndex]!.id;
			return store;
		});
	}

	canPrevious(): Readable<boolean> {
		return derived(this.store, $store => {
			if ($store.currentId === null) return false;
			const currentIndex = $store.files.findIndex(file => file.id === $store.currentId);
			return currentIndex > 0;
		});
	}

	canNext(): Readable<boolean> {
		return derived(this.store, $store => {
			if ($store.currentId === null) return false;
			const currentIndex = $store.files.findIndex(file => file.id === $store.currentId);
			return currentIndex < $store.files.length - 1;
		});
	}
}

const galleryStore = new GalleryStore();
export default galleryStore;
