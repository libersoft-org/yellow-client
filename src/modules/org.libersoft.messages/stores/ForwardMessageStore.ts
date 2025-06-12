import { derived, writable } from 'svelte/store';
import type { Message, Conversation } from '../types.ts';

export enum ForwardedMessageType {
	MESSAGE = 'message',
}

export interface ForwardedMessage {
	type: ForwardedMessageType;
	data: Message;
}

export interface ForwardMessageStoreValue {
	forwardedMessage: ForwardedMessage | null;
	sentToConversations: Conversation[];
}

export class ForwardMessageStore {
	store = writable<ForwardMessageStoreValue>({
		forwardedMessage: null,
		sentToConversations: [],
	});

	setForwardedMessage(forwardedMessage: ForwardedMessage | null) {
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

	startForwardedMessage(forwardedMessage: ForwardedMessage) {
		console.log('startForwardedMessage:', forwardedMessage);
		// Clear sent conversations when starting a new forward operation
		this.clearSentToConversations();
		this.setForwardedMessage(forwardedMessage);
		forwardMessageModalOpen.set(true);
	}

	close() {
		this.setForwardedMessage(null);
		this.clearSentToConversations();
		forwardMessageModalOpen.set(false);
	}
}

export const forwardMessageStore = new ForwardMessageStore();
export const forwardMessageModalOpen = writable(false);
