import { get } from 'svelte/store';
import { notificationsEnabled } from './core';
import { invoke } from '@tauri-apps/api/core';
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

let custom_notifications_window_ready = true;
let queue: YellowNotification[] = [];
let counter = 0;

export function addNotification(notification: YellowNotification): void {
 let enabled = get(notificationsEnabled);

 console.log('addNotification: enabled:', enabled, 'IS_TAURI:', IS_TAURI, 'IS_TAURI_MOBILE:', IS_TAURI_MOBILE, 'CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS, 'BROWSER:', BROWSER);

 //if (!enabled) return;

 notification.id = Math.random().toString(36).substr(2, 9);
 if (!notification.title) {
  notification.title = 'Notification ' + counter++;
 }
 if (CUSTOM_NOTIFICATIONS) {
  if (!custom_notifications_window_ready) {
   queue.push(notification);
  } else {
   sendCustomNotification(notification);
  }
 } else if (BROWSER) {
  showBrowserNotification(notification);
 }
}

async function sendCustomNotification(notification: YellowNotification): void {
 console.log('sendCustomNotification');
 let s = await store();
 console.log('store:', s);
 s?.set(notification.id, notification);
}

function sendQueuedNotifications(): void {
 queue.forEach(sendCustomNotification);
 queue = [];
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
