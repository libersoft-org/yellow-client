import { localStorageSharedStore } from '../../lib/svelte-shared-store.ts';
import { derived } from 'svelte/store';

export const defaultGifServers = ['https://gifs.libersoft.org'];
export const gif_servers = localStorageSharedStore('gif_servers', defaultGifServers);
export const gif_server_index = localStorageSharedStore('gif_server_index', 0);
export const gif_server = derived([gif_servers, gif_server_index], ([$gif_servers, $gif_server_index]) => $gif_servers[$gif_server_index]);
