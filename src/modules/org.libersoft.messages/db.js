import Dexie from 'dexie';

export const db = new Dexie('stickers');
db.version(1).stores({
 stickers: 'id, name, stickerset, server, url',
 stickersets: 'id, alias, name, animated, priority, created, server, url',
 servers: 'name',
});
