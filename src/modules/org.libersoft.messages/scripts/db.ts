import Dexie, { type Table } from 'dexie';

class StickersDB extends Dexie {
	stickers!: Table;
	stickersets!: Table;
	servers!: Table;

	constructor() {
		super('stickers');
		this.version(8).stores({
			stickers: 'uid++, id, name, stickerset, server, url',
			stickersets: 'uid++, id, alias, name, animated, priority, server, created, url',
			servers: 'name',
		});
	}
}

export const stickers_db = new StickersDB();

class MessagesDB extends Dexie {
	outgoing!: Table;

	constructor() {
		super('messages');
		this.version(2).stores({
			outgoing: '++id, account, data',
		});
	}
}

export const messages_db = new MessagesDB();
