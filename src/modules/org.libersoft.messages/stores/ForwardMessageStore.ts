import { derived, writable } from 'svelte/store';
import type { Message } from '../types.ts';

export enum ForwardedMessageType {
	MESSAGE = 'message',
}

export interface ForwardedMessage {
	type: ForwardedMessageType;
	data: Message;
}

export interface ForwardMessageStoreValue {
	open: boolean;
	forwardedMessage: ForwardedMessage | null;
}

export class ForwardMessageStore {
	store = writable<ForwardMessageStoreValue>({
		open: false,
		forwardedMessage: null,
	});

	isOpen() {
		return derived(this.store, ($store) => $store.open);
	}

	setForwardedMessage(forwardedMessage: ForwardedMessage | null) {
		this.store.update((store) => {
			store.forwardedMessage = forwardedMessage;
			return store;
		});
	}

	setOpen(open: boolean) {
		this.store.update((store) => {
			store.open = open;
			return store;
		});
	}

	getForwardedMessage() {
		return derived(this.store, ($store) => $store.forwardedMessage);
	}

	startForwardedMessage(forwardedMessage: ForwardedMessage) {
		this.setForwardedMessage(forwardedMessage);
		this.setOpen(true);
	}

	close() {
		this.setForwardedMessage(null);
		this.setOpen(false);
	}
}

const forwardMessageStore = new ForwardMessageStore();
export default forwardMessageStore;
