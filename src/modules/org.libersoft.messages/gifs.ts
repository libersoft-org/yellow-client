import { localStorageSharedStore } from '../../lib/svelte-shared-store.js';
import { derived, type Writable, type Readable } from 'svelte/store';

export const gif_servers: Writable<string[]> = localStorageSharedStore('gif_servers', ['https://gifs.libersoft.org']);
export const gif_server_index: Writable<number> = localStorageSharedStore('gif_server_index', 0);
export const gif_server: Readable<string> = derived(
  [gif_servers, gif_server_index],
  ([$gif_servers, $gif_server_index]) => $gif_servers[$gif_server_index]
);
