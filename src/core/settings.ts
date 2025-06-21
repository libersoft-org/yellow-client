import { IS_TAURI_DEBUG_MODE } from './tauri.ts';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';

export const runOnSystemStartup = localStorageSharedStore('runOnSystemStartup', true);
export const showTrayIcon = localStorageSharedStore('showTrayIcon', true);
export const closeToMinimize = localStorageSharedStore('closeToMinimize', !IS_TAURI_DEBUG_MODE);
export const zoom = localStorageSharedStore('zoom', 1);
export const followBrowserTheme = localStorageSharedStore('followBrowserTheme', true);
