import { log, TAURI } from './tauri.ts';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { get } from 'svelte/store';
import { enable, disable } from '@tauri-apps/plugin-autostart';
import { createTrayIcon, destroyTrayIcon } from './tray_icon.ts';

export const runOnSystemStartup = localStorageSharedStore('runOnSystemStartup', true);
export const showTrayIcon = localStorageSharedStore('showTrayIcon', true);
export const closeToMinimize = localStorageSharedStore('closeToMinimize', true);
export const zoom = localStorageSharedStore('zoom', 1);
