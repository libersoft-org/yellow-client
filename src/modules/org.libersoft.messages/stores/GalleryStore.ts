import { get, writable, derived } from 'svelte/store';
//import filesService from '@/org.libersoft.messages/services/Files/FilesService.ts';
//import { LocalFileStatus } from '@/org.libersoft.messages/services/LocalDB/FilesLocalDB.ts';

export interface GalleryFile {
	id: string | number;
	loaded: boolean;
	url?: string;
	fileName?: string;
	alt?: string; // fallbacks to fileName
	// fileMimeType: string;
	loadFile?: () => Promise<Omit<GalleryFile, 'loadFile'>>;
}

export interface GalleryStoreValue {
	show: boolean;
	files: GalleryFile[];
	currentId: GalleryFile['id'] | null;
}

export class GalleryStore {
	store = writable<GalleryStoreValue>({
		show: false,
		files: [],
		currentId: null,
	});

	value() {
		return get(this.store);
	}

	setShow(show: boolean) {
		this.store.update(store => {
			store.show = show;
			return store;
		});
	}

	setFiles(files: GalleryFile[]) {
		this.store.update(store => {
			store.files = files;
			return store;
		});
	}

	updateFile(id: GalleryFile['id'], file: Omit<GalleryFile, 'id'>) {
		this.store.update(store => {
			const index = store.files.findIndex(f => f.id === id);
			if (index === -1) {
				return store;
			}
			store.files[index] = {
				...store.files[index],
				...file,
			};
			return store;
		});
	}

	setCurrentId(currentIndex: number) {
		this.store.update(store => {
			store.currentId = currentIndex;
			return store;
		});
	}

	getFile(id: GalleryFile['id']) {
		return get(this.store).files.find(file => file.id === id);
	}

	currentFile() {
		return derived(this.store, $store => {
			if ($store.currentId === null) {
				return null;
			}
			return $store.files.find(file => file.id === $store.currentId);
		});
	}

	previous() {
		this.store.update(store => {
			if (store.currentId === null) {
				return store;
			}
			const currentIndex = store.files.findIndex(file => file.id === store.currentId);
			const nextIndex = currentIndex - 1;
			if (nextIndex < 0) {
				return store;
			}
			store.currentId = store.files[nextIndex].id;
			return store;
		});
	}

	next() {
		this.store.update(store => {
			if (store.currentId === null) {
				return store;
			}
			const currentIndex = store.files.findIndex(file => file.id === store.currentId);
			const nextIndex = currentIndex + 1;
			if (nextIndex >= store.files.length) {
				return store;
			}
			store.currentId = store.files[nextIndex].id;
			return store;
		});
	}

	canPrevious() {
		return derived(this.store, $store => {
			if ($store.currentId === null) {
				return false;
			}
			const currentIndex = $store.files.findIndex(file => file.id === $store.currentId);
			return currentIndex > 0;
		});
	}

	canNext() {
		return derived(this.store, $store => {
			if ($store.currentId === null) {
				return false;
			}
			const currentIndex = $store.files.findIndex(file => file.id === $store.currentId);
			return currentIndex < $store.files.length - 1;
		});
	}
}

const galleryStore = new GalleryStore();
export default galleryStore;
