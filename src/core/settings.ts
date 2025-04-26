import { log, TAURI } from './tauri.ts';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { get } from 'svelte/store';
import { enable, disable } from '@tauri-apps/plugin-autostart';
import { createTrayIcon, destroyTrayIcon } from './tray_icon.ts';

export const runOnSystemStartup = localStorageSharedStore('runOnSystemStartup', true);
export const showTrayIcon = localStorageSharedStore('showTrayIcon', true);
export const closeToMinimize = localStorageSharedStore('closeToMinimize', true);
export const zoom = localStorageSharedStore('zoom', 1);

// Set up store subscriptions but export the unsubscribe functions for cleanup
export const settingsUnsubscribers = {
 runOnSystemStartup: runOnSystemStartup.subscribe(async value => {
  if (!TAURI) return;
  log.debug('runOnSystemStartup changed:', value);
  if (value) {
   await enable();
  } else {
   await disable();
  }
 }),

 showTrayIcon: showTrayIcon.subscribe(async value => {
  if (!TAURI) return;
  log.debug('showTrayIcon changed:', value);
  if (value) {
   await createTrayIcon();
  } else {
   await destroyTrayIcon();
  }
 }),
};
