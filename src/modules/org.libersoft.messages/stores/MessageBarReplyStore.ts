import { derived, writable, type Readable } from 'svelte/store';
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

	isOpen(): Readable<boolean> {
		return derived(this.store, $store => $store.open);
	}

	setReplyTo(replyTo: IReplyTo | null): void {
		this.store.update(store => {
			store.replyTo = replyTo;
			return store;
		});
	}

	setOpen(open: boolean): void {
		this.store.update(store => {
			store.open = open;
			return store;
		});
	}

	getReplyTo(): Readable<IReplyTo | null> {
		return derived(this.store, $store => $store.replyTo);
	}

	startReplyTo(replyTo: IReplyTo): void {
		this.setReplyTo(replyTo);
		this.setOpen(true);
	}

	close(): void {
		this.setReplyTo(null);
		this.setOpen(false);
	}
}

const messageBarReplyStore = new MessageBarReplyStore();
export default messageBarReplyStore;
