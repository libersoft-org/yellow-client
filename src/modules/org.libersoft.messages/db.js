// db.js
import Dexie from 'dexie';

export const db = new Dexie('myDatabase');
db.version(1).stores({
 stickers: 'id, name, stickerset, url',
 stickersets: 'id, alias, name, animated, priority, created, server, url',
 servers: 'name',
});
