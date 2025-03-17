import { get } from 'svelte/store';
import { notificationsEnabled } from './core';
import { store } from './notifications_store.ts';
import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER, debug } from './tauri.ts';
import { invoke } from '@tauri-apps/api/core';

export interface YellowNotification {
 id?: string;
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
 if (!_events) {
  _events = await store('notification-events');
  _events.onChange((key, value) => {
   debug('notification-events.onChange:', key, value);
   notifications[key] && notifications[key].callback(value);
  });
 }
 invoke('create_notifications_window');
}

export function addNotification(notification: YellowNotification): void {
 let enabled = get(notificationsEnabled);

 debug('addNotification: enabled:', enabled, 'IS_TAURI:', IS_TAURI, 'IS_TAURI_MOBILE:', IS_TAURI_MOBILE, 'CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS, 'BROWSER:', BROWSER);

 if (!enabled) return;

 notification.id = Math.random().toString(36);
 if (!notification.title) {
  notification.title = 'Notification ' + counter++;
 }
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

export function removeNotification(id: string): void {
 notifications[id] && notifications.delete(id);
 let s = store('notifications');
 s?.delete(id);
}

export function clearNotifications(): void {
 notifications.clear();
 let s = store('notifications');
 s?.clear();
}
