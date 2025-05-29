import { derived, writable } from 'svelte/store';
import type { Message } from '../types.ts';

export enum ReplyToType {
  MESSAGE = 'message',
}

export interface ReplyTo {
  type: ReplyToType;
  data: Message;
}

export interface MessageBarReplyStoreValue {
  open: boolean;
  replyTo: ReplyTo | null;
}

export class MessageBarReplyStore {
  store = writable<MessageBarReplyStoreValue>({
    open: false,
    replyTo: null,
  });

  isOpen() {
    return derived(this.store, ($store) => $store.open);
  }

  setReplyTo(replyTo: ReplyTo | null) {
    this.store.update((store) => {
      store.replyTo = replyTo;
      return store;
    });
  }

  setOpen(open: boolean) {
    this.store.update((store) => {
      store.open = open;
      return store;
    });
  }

  getReplyTo() {
    return derived(this.store, ($store) => $store.replyTo);
  }

  startReplyTo(replyTo: ReplyTo) {
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
