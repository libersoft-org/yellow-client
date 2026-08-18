import { derived, writable, type Readable } from 'svelte/store';

export interface IAudioRecorderStoreValue {
	open: boolean;
}

export class AudioRecorderStore {
	store = writable<IAudioRecorderStoreValue>({
		open: false,
	});

	isOpen(): Readable<boolean> {
		return derived(this.store, $store => $store.open);
	}

	setOpen(open: boolean): void {
		this.store.update(store => {
			store.open = open;
			return store;
		});
	}
}

const audioRecorderStore = new AudioRecorderStore();
export default audioRecorderStore;
