import { get } from 'svelte/store';
import { notificationsEnabled } from './core';
import { store } from './notifications_store.ts';
import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER, log } from './tauri.ts';
import { invoke } from '@tauri-apps/api/core';
import { enableCustomNotifications } from './notifications_settings.ts';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { isPermissionGranted, requestPermission, sendNotification, registerActionTypes, createChannel, Importance, Visibility, onAction } from '@tauri-apps/plugin-notification';

export interface YellowNotification {
 id: string;
 ts: number;
 title: string;
 body?: string;
 icon?: string;
 sound?: string;
 callback?: CallableFunction;
}

let counter = 0;

let notifications: Map<string, YellowNotification> = new Map();
let _events;

async function initCustomNotifications() {
 //log.debug('init, CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS, '_events:', _events);
 if (!CUSTOM_NOTIFICATIONS) return;
 let _notifications = await store('notifications');
 // for (let [id, notification] of _notifications.entries()) {
 //  log.debug('initCustomNotifications:', id, notification);
 //  notifications.delete(id);
 // }
 if (!_events) {
  _events = await store('notification-events');
  _events.onChange(onNotificationEvent);
  //log.debug('getCurrentWindow:', getCurrentWindow());
  //log.debug('getCurrentWindow().onCloseRequested:', getCurrentWindow().onCloseRequested);
  //  await getCurrentWindow().onCloseRequested(async (event) => {
  //  log.debug('close-requested');
  //  event.preventDefault();
  //  clearNotifications();
  // });
 }
}

async function onNotificationEvent(id: string, event: string) {
 log.debug('onNotificationEvent:', id, event);
 let n = notifications.get(id);
 if (n && n.callback) {
  await n.callback(JSON.parse(event));
 }
 //if (event === 'close') {
 await removeNotification(id);
 //}
}

export async function addNotification(notification: Partial<YellowNotification>): Promise<string | undefined> {
 let enabled = get(notificationsEnabled);

 //log.debug('addNotification: enabled:', enabled, 'IS_TAURI:', IS_TAURI, 'IS_TAURI_MOBILE:', IS_TAURI_MOBILE, 'CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS, 'BROWSER:', BROWSER);

 if (!enabled) return;

 let n: YellowNotification = {
  id: Math.random().toString(36),
  ts: Date.now(),
  title: 'Notification ' + counter++,
  ...notification,
 };

 if (CUSTOM_NOTIFICATIONS && get(enableCustomNotifications)) {
  sendCustomNotification(n);
 } else if (BROWSER) {
  showBrowserNotification(n);
 } else {
  await sendTauriNotification(n);
 }

 return n.id;
}

async function sendTauriNotification(notification: YellowNotification) {
 let permissionGranted = await isPermissionGranted();
 log.debug('permissionGranted:', permissionGranted);
 if (!permissionGranted) {
  log.debug('requesting permission');
  const permission = await requestPermission();
  permissionGranted = permission === 'granted';
 }
 log.debug('permissionGranted2:', permissionGranted);
 if (!permissionGranted) {
  return;
 }
 playNotificationSound(notification);
 sendNotification({ title: notification.title, body: notification.body, icon: notification.icon, silent: true });
 await registerActionTypes([
  {
   id: 'tauri',
   actions: [
    {
     id: 'my-action',
     title: 'Settings',
    },
   ],
  },
 ]);
 await createChannel({
  id: 'new-messages',
  name: 'New Messages',
  lights: true,
  vibration: true,
  importance: Importance.Default,
  visibility: Visibility.Private,
 });
 await onAction(n => {
  log.debug('onAction:', n);
  //notification.callback?.();
 });
}

async function sendCustomNotification(notification: YellowNotification): Promise<void> {
 log.debug('sendCustomNotification');
 await initCustomNotifications();
 let s = await store('notifications');
 //log.debug('store:', s);
 invoke('create_notifications_window', {});
 if (notification.id) {
  notifications.set(notification.id, notification);
  s?.set(notification.id, notification);
 } else {
  log.debug('notification.id is undefined');
 }
}

function playNotificationSound(notification: YellowNotification): void {
 const audio = new Audio(notification.sound || 'modules/org.libersoft.messages/audio/message.mp3');
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
  notification.callback?.();
 };
}

export async function deleteNotification(id: string): Promise<void> {
 //log.debug('deleteNotification:', id);
 notifications[id] && notifications.delete(id);
 let s = await store('notifications');
 s.set(id, null);
}

export async function removeNotification(id: string): Promise<void> {
 let s = await store('notifications');
 await s.delete(id);
 //log.debug('removed.');
}
