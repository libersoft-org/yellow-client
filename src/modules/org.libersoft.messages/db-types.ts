import Dexie, { type Table } from 'dexie';

// Sticker interfaces
export interface Sticker {
  uid?: number;
  id: string;
  name: string;
  stickerset: string;
  server: string;
  url: string;
}

export interface StickerSet {
  uid?: number;
  id: string;
  alias: string;
  name: string;
  animated: boolean;
  priority: number;
  server: string;
  created: string;
  url: string;
}

export interface StickerServer {
  name: string;
}

// Messages interfaces
export interface OutgoingMessage {
  id?: number;
  account: string;
  data: any;
}

// Extended Dexie classes with typed tables
export class StickersDB extends Dexie {
  stickers!: Table<Sticker>;
  stickersets!: Table<StickerSet>;
  servers!: Table<StickerServer>;

  constructor() {
    super('stickers');
    this.version(8).stores({
      stickers: 'uid++, id, name, stickerset, server, url',
      stickersets: 'uid++, id, alias, name, animated, priority, server, created, url',
      servers: 'name',
    });
  }
}

export class MessagesDB extends Dexie {
  outgoing!: Table<OutgoingMessage>;

  constructor() {
    super('messages');
    this.version(2).stores({
      outgoing: '++id, account, data',
    });
  }
}
