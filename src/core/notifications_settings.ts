import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { CUSTOM_NOTIFICATIONS, IS_TAURI } from './tauri.ts';
import { derived, writable } from 'svelte/store';

export const notificationsEnabled = localStorageSharedStore('notifications_enabled', IS_TAURI);
export const isRequestingNotificationsPermission = writable(false);
export const notificationsSettingsAlert = writable('');

export let selectedMonitorName = localStorageSharedStore('selectedMonitorName', 'main_window_monitor');
export let selectedNotificationsCorner = localStorageSharedStore('selectedNotificationsCorner', 'top-right');
export let enableCustomNotifications = localStorageSharedStore('enableCustomNotifications', true);
export let customNotificationsOn = derived(enableCustomNotifications, $enableCustomNotifications => {
 return CUSTOM_NOTIFICATIONS && $enableCustomNotifications;
});
export let animationName = localStorageSharedStore('notification_animation_duration', 'zoom');
export let animationDuration = localStorageSharedStore('notification_animation_duration', 400);

export let mainWindowMonitor = localStorageSharedStore('mainWindowMonitor', null);
export let bgColor = localStorageSharedStore('bgColor', '#222222');
export let titleColor = localStorageSharedStore('titleColor', '#ffffff');
export let descColor = localStorageSharedStore('descColor', '#888888');
