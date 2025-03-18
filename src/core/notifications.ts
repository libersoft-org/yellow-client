import { get } from 'svelte/store';
import { notificationsEnabled } from './core';
import { store } from './notifications_store.ts';
import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER, debug } from './tauri.ts';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

export interface YellowNotification {
 id?: string;
 ts?: number;
 title: string;
 body: string;
 icon?: string;
 sound?: string;
 callback: CallableFunction;
}

let counter = 0;

let notifications: Map<string, YellowNotification> = new Map();
let _events;

async function initCustomNotifications() {
 debug('init, CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS, '_events:', _events);
 if (!CUSTOM_NOTIFICATIONS) return;
 let _notifications = await store('notifications');
 // for (let [id, notification] of _notifications.entries()) {
 //  debug('initCustomNotifications:', id, notification);
 //  notifications.delete(id);
 // }
 if (!_events) {
  _events = await store('notification-events');
  _events.onChange(onNotificationEvent);
  debug('getCurrentWindow:', getCurrentWindow());
  debug('getCurrentWindow().onCloseRequested:', getCurrentWindow().onCloseRequested);
  //  await getCurrentWindow().onCloseRequested(async (event) => {
  //  debug('close-requested');
  //  event.preventDefault();
  //  clearNotifications();
  // });
 }
}

async function onNotificationEvent(id: string, event: string) {
 debug('onNotificationEvent:', id, event);
 await notifications?.[id]?.callback(event);
 if (event === 'close') {
  await removeNotification(id);
 }
}

export function addNotification(notification: YellowNotification): void {
 let enabled = get(notificationsEnabled);

 debug('addNotification: enabled:', enabled, 'IS_TAURI:', IS_TAURI, 'IS_TAURI_MOBILE:', IS_TAURI_MOBILE, 'CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS, 'BROWSER:', BROWSER);

 if (!enabled) return;

 notification.id = Math.random().toString(36);
 if (!notification.title) {
  notification.title = 'Notification ' + counter++;
 }
 notification.ts = Date.now();
 if (CUSTOM_NOTIFICATIONS) {
  sendCustomNotification(notification);
 } else if (BROWSER) {
  showBrowserNotification(notification);
 }
}

async function sendCustomNotification(notification: YellowNotification): Promise<void> {
 debug('sendCustomNotification');
 await initCustomNotifications();
 let s = await store('notifications');
 debug('store:', s);
 invoke('create_notifications_window', {});
 notifications.set(notification.id, notification);
 s?.set(notification.id, notification);
}

function playNotificationSound(notification: YellowNotification): void {
 const audio = new Audio(notification.sound || 'sounds/notification.mp3');
 audio.play();
}

function showBrowserNotification(notification: YellowNotification) {
 playNotificationSound(notification);
 let n = new Notification(notification.title, {
  body: notification.body,
  icon: notification.icon,
  silent: true,
 });
 n.onclick = () => {
  notification.callback();
 };
}

export async function removeNotification(id: string): void {
 debug('removeNotification:', id);
 notifications[id] && notifications.delete(id);

 let s = await store('notifications');
 debug('removeNotification store:', s);
 debug('removeNotification store.entries:', await s.entries);
 debug('removeNotification store.get:', await s.get(id));
 debug('removeNotification store.delete:', s.delete);
 await s.delete(id);
 debug('removed.');
}

/*export function clearNotifications(): void {
 notifications.clear();
 let s = store('notifications');
 s?.clear();
}
*/
