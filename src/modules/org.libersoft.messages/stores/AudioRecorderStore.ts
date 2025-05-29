import { derived, writable } from 'svelte/store';

export interface AudioRecorderStoreValue {
	open: boolean;
}

export class AudioRecorderStore {
	store = writable<AudioRecorderStoreValue>({
		open: false,
	});

	isOpen() {
		return derived(this.store, $store => $store.open);
	}

	setOpen(open: boolean) {
		this.store.update(store => {
			store.open = open;
			return store;
		});
	}
}

const audioRecorderStore = new AudioRecorderStore();
export default audioRecorderStore;
