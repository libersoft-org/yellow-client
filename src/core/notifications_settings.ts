import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';

export let selectedMonitor = localStorageSharedStore('selectedMonitor', null);
export let selectedNotificationsCorner = localStorageSharedStore('selectedNotificationsCorner', 'top-right');
export let enableCustomNotifications = localStorageSharedStore('enableCustomNotifications', false);
