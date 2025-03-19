import { get, type Writable, writable } from 'svelte/store';
import { notificationsEnabled } from './core';
import { store } from './notifications_store.ts';
import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER, debug } from './tauri.ts';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow, type Monitor } from '@tauri-apps/api/window';
import { availableMonitors } from '@tauri-apps/api/window';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';

export let monitors: Writable<Monitor[]> = writable([]);
export let selectedMonitor: Writable<Monitor | null> = localStorageSharedStore('selectedMonitor', null);
export let selectedNotificationsCorner = localStorageSharedStore('selectedNotificationsCorner', 'top-right');
export let notificationsDirection = writable(getNotificationsDirection());

function getNotificationsDirection() {
 let c = get(selectedNotificationsCorner);
 if (c === 'top-right' || c === 'top-left') {
  return 'down';
 } else return 'up';
}

selectedNotificationsCorner.subscribe(value => {
 notificationsDirection.set(getNotificationsDirection());
});

function notificationWindowSettings() {
 let d = get(notificationsDirection);
 let width = 400;
 let monitor_name = get(selectedMonitor);
 let m = get(monitors).find(m => m.name === monitor_name);
 if (m && m.size) {
  let corner = get(selectedNotificationsCorner);
  let x;
  let y;
  if (corner === 'top-right') {
   x = m.size.width - width;
   y = 0;
  } else if (corner === 'top-left') {
   x = 0;
   y = 0;
  } else if (corner === 'bottom-right') {
   x = m.size.width - width;
   y = m.size.height - 1;
  } else if (corner === 'bottom-left') {
   x = 0;
   y = m.size.height - 1;
  }
  return {
   direction: d,
   x: x + m.position.x,
   y: y + m.position.y,
  };
 } else {
  return {
   direction: 'down',
   x: 0,
   y: 0,
  };
 }
}

async function pushNotificationsWindowSettings() {
 let s = await store('notifications-window-settings', false, true);
 let settings = await notificationWindowSettings();
 console.log('pushNotificationsWindowSettings:', settings);
 s.set('settings', settings);
}

selectedNotificationsCorner.subscribe(async () => {
 await pushNotificationsWindowSettings();
});

selectedMonitor.subscribe(async () => {
 await pushNotificationsWindowSettings();
});

setInterval(async () => {
 if (window.__TAURI__) {
  monitors.set(await availableMonitors());
  console.log(get(monitors));
 }
}, 1000);

function updateNotificationsMonitor() {
 let monitor = get(selectedMonitor);
 if (!monitor) {
  selectedMonitor.set(get(monitors)?.[0]);
 }
}

export interface YellowNotification {
 id: string;
 ts: number;
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

export function addNotification(notification: Partial<YellowNotification>): void {
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
 if (notification.id) {
  notifications.set(notification.id, notification);
  s?.set(notification.id, notification);
 } else {
  debug('notification.id is undefined');
 }
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

export async function removeNotification(id: string): Promise<void> {
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
