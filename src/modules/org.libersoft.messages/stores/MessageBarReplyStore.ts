import { derived, writable } from 'svelte/store';
import type { Message } from '@/org.libersoft.messages/scripts/types.ts';

export enum ReplyToType {
	MESSAGE = 'message',
}

export interface IReplyTo {
	type: ReplyToType;
	data: Message;
}

export interface IMessageBarReplyStoreValue {
	open: boolean;
	replyTo: IReplyTo | null;
}

export class MessageBarReplyStore {
	store = writable<IMessageBarReplyStoreValue>({
		open: false,
		replyTo: null,
	});

	isOpen() {
		return derived(this.store, $store => $store.open);
	}

	setReplyTo(replyTo: IReplyTo | null) {
		this.store.update(store => {
			store.replyTo = replyTo;
			return store;
		});
	}

	setOpen(open: boolean) {
		this.store.update(store => {
			store.open = open;
			return store;
		});
	}

	getReplyTo() {
		return derived(this.store, $store => $store.replyTo);
	}

	startReplyTo(replyTo: IReplyTo) {
		this.setReplyTo(replyTo);
		this.setOpen(true);
	}

	close() {
		this.setReplyTo(null);
		this.setOpen(false);
	}
}

const messageBarReplyStore = new MessageBarReplyStore();
export default messageBarReplyStore;
