import { derived, get, writable } from 'svelte/store';
import type { Message, Conversation } from '@/org.libersoft.messages/scripts/types.ts';

export let modalForwardMessageStore = writable<any>(null);

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

	setForwardedMessage(forwardedMessage: IForwardedMessage | null) {
		this.store.update(store => {
			store.forwardedMessage = forwardedMessage;
			return store;
		});
	}

	getForwardedMessage() {
		return derived(this.store, $store => $store.forwardedMessage);
	}

	getSentToConversations() {
		return derived(this.store, $store => $store.sentToConversations);
	}

	addSentToConversation(conversation: Conversation) {
		this.store.update(store => {
			store.sentToConversations.push(conversation);
			return store;
		});
	}

	clearSentToConversations() {
		this.store.update(store => {
			store.sentToConversations = [];
			return store;
		});
	}

	startForwardedMessage(forwardedMessage: IForwardedMessage) {
		console.log('startForwardedMessage:', forwardedMessage);
		// Clear sent conversations when starting a new forward operation
		this.clearSentToConversations();
		this.setForwardedMessage(forwardedMessage);
		get(modalForwardMessageStore)?.open();
	}

	close() {
		this.setForwardedMessage(null);
		this.clearSentToConversations();
		get(modalForwardMessageStore)?.close();
	}
}

export const forwardMessageStore = new ForwardMessageStore();
