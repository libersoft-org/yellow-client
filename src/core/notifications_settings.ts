import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { CUSTOM_NOTIFICATIONS, TAURI } from './tauri.ts';
import { derived, writable, type Unsubscriber } from 'svelte/store';

// Create all the shared stores
export const notificationsEnabled = localStorageSharedStore('notifications_enabled', TAURI);
export const notificationsSoundEnabled = localStorageSharedStore('notifications_sound_enabled', true);
export const notificationsPermission = writable(null);
export const isRequestingNotificationsPermission = writable(false);
export const notificationsSettingsAlert = writable('');

export const selectedMonitorName = localStorageSharedStore<string | null>('selectedMonitorName', 'main_window_monitor');
export const selectedNotificationsCorner = localStorageSharedStore('selectedNotificationsCorner', 'bottom-right');
export const enableCustomNotifications = localStorageSharedStore('enableCustomNotifications', true);
export const customNotificationsOn = derived(enableCustomNotifications, $enableCustomNotifications => {
 return CUSTOM_NOTIFICATIONS && $enableCustomNotifications;
});
export const animationName = localStorageSharedStore('notification_animation_name', 'zoom');
export const animationDuration = localStorageSharedStore('notification_animation_duration', 400);

export const mainWindowMonitor = localStorageSharedStore<string | null>('mainWindowMonitor', null);

export const titleMaxLines = localStorageSharedStore('titleMaxLines', 1);
export const bodyMaxLines = localStorageSharedStore('bodyMaxLines', 3);

export const bgColor = localStorageSharedStore('bgColor', '#222222');
export const bgColorHover = localStorageSharedStore('bgColorHover', '#333333');
export const borderColor = localStorageSharedStore('borderColor', '#444444');
export const titleColor = localStorageSharedStore('titleColor', '#ffffff');
export const descColor = localStorageSharedStore('descColor', '#888888');
