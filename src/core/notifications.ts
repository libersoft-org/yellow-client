import { get } from 'svelte/store';
import { notificationsEnabled } from './core';
import { store } from './notifications_store.ts';
import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER } from './tauri.ts';

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

async function init() {
 if (!CUSTOM_NOTIFICATIONS) return;
 if (_events) return;
 _events = await store('notification-events');
 _events.onChange((key, value) => {
  notifications[key] && notifications[key].callback();
 });
}

export function addNotification(notification: YellowNotification): void {
 let enabled = get(notificationsEnabled);

 console.log('addNotification: enabled:', enabled, 'IS_TAURI:', IS_TAURI, 'IS_TAURI_MOBILE:', IS_TAURI_MOBILE, 'CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS, 'BROWSER:', BROWSER);

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

async function sendCustomNotification(notification: YellowNotification): void {
 console.log('sendCustomNotification');
 await init();
 let s = await store('notifications');
 console.log('store:', s);
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
