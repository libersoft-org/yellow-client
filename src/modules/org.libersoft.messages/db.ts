import Dexie from 'dexie';

export const stickers_db = new Dexie('stickers');
stickers_db.version(2).stores({
 stickers: 'id, name, stickerset, server, url',
 stickersets: 'id, alias, name, animated, priority, created, server, url',
 servers: 'name',
});

export const messages_db = new Dexie('messages');
messages_db.version(2).stores({
 outgoing: '++id, account, data',
});
