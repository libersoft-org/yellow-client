import Dexie from 'dexie';

export const stickers_db = new Dexie('stickers');
stickers_db.version(8).stores({
	stickers: 'uid++, id, name, stickerset, server, url',
	stickersets: 'uid++, id, alias, name, animated, priority, server, created, url',
	servers: 'name',
});

export const messages_db = new Dexie('messages');
messages_db.version(2).stores({
	outgoing: '++id, account, data',
});
