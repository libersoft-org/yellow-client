import { get } from 'svelte/store';
import { notificationsEnabled } from './core';

export interface YellowNotification {
 title: string;
 body: string;
 icon?: string;
 sound?: string;
 callback: CallableFunction;
}

const IS_TAURI = Object.prototype.hasOwnProperty.call(window, '__TAURI__');
const BROWSER = !IS_TAURI;
const IS_TAURI_MOBILE = false; //(IS_TAURI && window.__TAURI__?.platform === 'android') || window.__TAURI__?.platform === 'ios';
const CUSTOM_NOTIFICATIONS = IS_TAURI && !IS_TAURI_MOBILE;

let custom_notifications_window_ready = false;
let queue: YellowNotification[] = [];

export function addNotification(notification: YellowNotification): void {
 if (!get(notificationsEnabled)) return;
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

function sendCustomNotification(notification: YellowNotification): void {
 //window.__TAURI__.invoke('addNotification', notification);
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
