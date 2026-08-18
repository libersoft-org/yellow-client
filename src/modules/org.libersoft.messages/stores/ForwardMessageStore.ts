import { derived, get, writable, type Readable } from 'svelte/store';
import type { Message, Conversation } from '@/org.libersoft.messages/scripts/types.ts';

export let windowForwardMessageStore = writable<any>(null);

export enum ForwardedMessageType {
	MESSAGE = 'message',
}

export interface IForwardedMessage {
	type: ForwardedMessageType;
	data: Message;
}

export interface IForwardMessageStoreValue {
	forwardedMessage: IForwardedMessage | null;
	sentToConversations: Conversation[];
}

export class ForwardMessageStore {
	store = writable<IForwardMessageStoreValue>({
		forwardedMessage: null,
		sentToConversations: [],
	});

	setForwardedMessage(forwardedMessage: IForwardedMessage | null): void {
		this.store.update(store => {
			store.forwardedMessage = forwardedMessage;
			return store;
		});
	}

	getForwardedMessage(): Readable<IForwardedMessage | null> {
		return derived(this.store, $store => $store.forwardedMessage);
	}

	getSentToConversations(): Readable<Conversation[]> {
		return derived(this.store, $store => $store.sentToConversations);
	}

	addSentToConversation(conversation: Conversation): void {
		this.store.update(store => {
			store.sentToConversations.push(conversation);
			return store;
		});
	}

	clearSentToConversations(): void {
		this.store.update(store => {
			store.sentToConversations = [];
			return store;
		});
	}

	startForwardedMessage(forwardedMessage: IForwardedMessage): void {
		console.log('startForwardedMessage:', forwardedMessage);
		// Clear sent conversations when starting a new forward operation
		this.clearSentToConversations();
		this.setForwardedMessage(forwardedMessage);
		get(windowForwardMessageStore)?.open();
	}

	close(): void {
		this.setForwardedMessage(null);
		this.clearSentToConversations();
		get(windowForwardMessageStore)?.close();
	}
}

export const forwardMessageStore = new ForwardMessageStore();
