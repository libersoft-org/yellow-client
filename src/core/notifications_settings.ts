import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { CUSTOM_NOTIFICATIONS } from './tauri.ts';
import { derived } from 'svelte/store';

export let selectedMonitor = localStorageSharedStore('selectedMonitor', null);
export let selectedNotificationsCorner = localStorageSharedStore('selectedNotificationsCorner', 'top-right');
export let enableCustomNotifications = localStorageSharedStore('enableCustomNotifications', true);
export let customNotificationsOn = derived(enableCustomNotifications, $enableCustomNotifications => {
 return CUSTOM_NOTIFICATIONS && $enableCustomNotifications;
});
