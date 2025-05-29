import { localStorageSharedStore } from '../../lib/svelte-shared-store.ts';
import { writable, derived } from 'svelte/store';

export const gif_servers = localStorageSharedStore('gif_servers', ['https://gifs.libersoft.org']);
export const gif_server_index = localStorageSharedStore('gif_server_index', 0);
export const gif_server = derived(
  [gif_servers, gif_server_index],
  ([$gif_servers, $gif_server_index]) => $gif_servers[$gif_server_index]
);
