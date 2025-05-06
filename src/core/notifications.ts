import { get, type Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { multiwindow_store } from './multiwindow_store.ts';
import { TAURI, TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER, log } from './tauri.ts';
import { invoke } from '@tauri-apps/api/core';
import { notificationsEnabled, isRequestingNotificationsPermission, notificationsSettingsAlert, enableCustomNotifications, mainWindowMonitor, selectedMonitorName, notificationsSoundEnabled } from './notifications_settings.ts';
import { playAndStopExample } from './audio.ts';
import {
 availableMonitors,
 currentMonitor,
 //getCurrentWindow,
} from '@tauri-apps/api/window';
import { isPermissionGranted, requestPermission, sendNotification, registerActionTypes, createChannel, Importance, Visibility, onAction } from '@tauri-apps/plugin-notification';
import { Mutex } from 'async-mutex';

/* yellow notifications, for use in core and modules */

export interface YellowNotification {
 id: string;
 ts: number;
 title: string;
 body?: string;
 icon?: string;
 sound?: string;
 callback?: CallableFunction;
 _audio?: HTMLAudioElement;
}

let counter = 0;
let notifications: Map<string, YellowNotification> = new Map();
let _events;
let browser_notifications: Map<string, Notification> = new Map();
let tauri_notifications: Map<string, Notification> = new Map();
export let exampleNotifications: Writable<Array<string>> = writable([]);

const updateExampleNotificationMutex = new Mutex();

export async function deleteExampleNotifications() {
 let v = get(exampleNotifications);
 for (let i of v) {
  await deleteNotification(i);
 }
 exampleNotifications.set([]);
}

export async function updateExampleNotification() {
 return updateExampleNotificationMutex.runExclusive(async () => {
  let v = get(exampleNotifications);
  log.debug('updateExampleNotification v:', v);
  if (v.length > 1) {
   await deleteNotification(v[0]);
   exampleNotifications.update(n => n.slice(1));
  }
  if (get(notificationsEnabled)) {
   let x = await addNotification({
    title: `Example Notification ${counter}`,
    body: 'This is an example notification',
    callback: event => {
     log.debug('example notification callback:', event);
     exampleNotifications.update(n => n.filter(i => i !== event.id));
    },
   });
   if (x) {
    exampleNotifications.update(n => [...n, x]);
   }
  } else {
   await deleteExampleNotifications();
  }
 });
}

export function setNotificationsEnabled(value) {
 if (!BROWSER) {
  notificationsEnabled.set(value);
  return;
 }
 console.log('Notification.permission:', Notification.permission, 'value:', value);
 if (get(notificationsEnabled) != value) {
  if (value) {
   if (Notification.permission !== 'granted') {
    if (Notification.permission === 'denied') {
     notificationsSettingsAlert.set('blocked');
     return;
    }
    isRequestingNotificationsPermission.set(true);
    Notification.requestPermission().then(permission => {
     console.log('Notification dialog callback:', permission);
     isRequestingNotificationsPermission.set(false);
     if (permission == 'granted') {
      console.log('notificationsEnabled.set(true)...');
      notificationsEnabled.set(true);
      notificationsSettingsAlert.set('');
     } else {
      notificationsEnabled.set(false);
      notificationsSettingsAlert.set('blocked');
     }
    });
   } else {
    notificationsEnabled.set(true);
   }
  } else {
   notificationsEnabled.set(false);
  }
 }
 notificationsSettingsAlert.set('');
 return;
}

export async function initBrowserNotifications() {
 if (BROWSER && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
  // fixme: ask for permission / in wizard?
 }
}

export async function initCustomNotifications() {
 log.debug('init, CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS, '_events:', _events);
 if (!CUSTOM_NOTIFICATIONS) return;
 let _notifications = await multiwindow_store('notifications');
 // for (let [id, notification] of _notifications.entries()) {
 //  log.debug('initCustomNotifications:', id, notification);
 //  notifications.delete(id);
 // }
 if (!_events) {
  _events = await multiwindow_store('notification-events');
  _events.onChange(onNotificationEvent);
  //log.debug('getCurrentWindow:', getCurrentWindow());
  //log.debug('getCurrentWindow().onCloseRequested:', getCurrentWindow().onCloseRequested);
  //  await getCurrentWindow().onCloseRequested(async (event) => {
  //  log.debug('close-requested');
  //  event.preventDefault();
  //  clearNotifications();
  // });
 }
 startMainWindowMonitorTimer();
}

function startMainWindowMonitorTimer() {
 log.debug('startMainWindowMonitorTimer');
 setInterval(async () => {
  let m = await currentMonitor();
  //log.debug('currentMonitor:', m);
  mainWindowMonitor.set(m?.name || null);
 }, 1000);
}

async function onNotificationEvent(id: string, event: string) {
 log.debug('onNotificationEvent:', id, event);
 let n = notifications.get(id);
 if (n && n.callback) {
  log.debug('notification callback called:', event);
  await n.callback(JSON.parse(event));
 }
 //if (event === 'close') {
 await removeNotification(id);
 //}
}

async function removeNotification(id: string): Promise<void> {
 log.debug('removeNotification:', id);
 let s = await multiwindow_store('notifications');
 await s.delete(id);
 //log.debug('removed.');
}

export async function addNotification(notification: Partial<YellowNotification>): Promise<string | null> {
 let enabled = get(notificationsEnabled);
 log.debug('addNotification: enabled:', enabled, 'TAURI:', TAURI, 'TAURI_MOBILE:', TAURI_MOBILE, 'CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS, 'BROWSER:', BROWSER);
 if (!enabled) return null;

 let n: YellowNotification = {
  id: Math.random().toString(36),
  ts: Date.now(),
  title: 'Notification ' + counter++,
  ...notification,
 };

 if (CUSTOM_NOTIFICATIONS && get(enableCustomNotifications)) {
  sendCustomNotification(n);
 } else if (BROWSER) {
  await showBrowserNotification(n);
 } else {
  await sendTauriNotification(n);
 }

 return n.id;
}

export async function deleteNotification(id: string): Promise<void> {
 log.debug('deleteNotification:', id);
 await deleteCustomNotification(id);
 await deleteBrowserNotification(id);
 await deleteTauriNotification(id);
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

 let icon = await toPngBlob(notification.icon);
 //icon = 'http://localhost:3000/favicon2.png';

 sendNotification({
  title: notification.title,
  body: notification.body,
  /* "On Android the icon must be placed in the app’s res/drawable folder."*/
  //icon: 'http://localhost:3000/favicon.png',
  //icon: icon,
  silent: true,
 });
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
 await onAction(async n => {
  log.debug('notification onAction:', n);
  await notification.callback?.('click');
 });
}

async function deleteTauriNotification(id: string): Promise<void> {
 log.debug('deleteTauriNotification:', id);
 let n = tauri_notifications.get(id);
 if (n) {
  log.debug('deleteTauriNotification:', id, n);
  await n.close();
  tauri_notifications.delete(id);
 }
}

async function sendCustomNotification(notification: YellowNotification): Promise<void> {
 //log.debug('sendCustomNotification');
 //await initCustomNotifications();
 let s = await multiwindow_store('notifications');
 log.debug('notifications store:', s);
 invoke('create_notifications_window', {});
 if (!notification.id) {
  log.debug('notification.id is undefined');
  return;
 }
 notifications.set(notification.id, notification);
 s?.set(notification.id, notification);
 //log.debug('sendCustomNotification:', notification.id, notification);
}

async function deleteCustomNotification(id: string): Promise<void> {
 if (!CUSTOM_NOTIFICATIONS) return;
 notifications[id] && notifications.delete(id);
 let s = await multiwindow_store('notifications');
 await s.set(id, null);
}

async function showBrowserNotification(notification: YellowNotification) {
 playNotificationSound(notification);
 console.log('showBrowserNotification:', notification);
 let icon = await toPngBlob(notification.icon);

 let n = new Notification(notification.title, {
  tag: notification.id,
  body: notification.body,
  //  icon: 'http://localhost:3000/favicon2.png',
  //  icon: 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7', //icon,
  icon: icon,
  //silent: false,
  //vibrate: [200, 100, 200],
 });
 n.onclick = async e => {
  log.debug('notification onclick:', e);
  await notification.callback?.('click');
 };
 browser_notifications.set(notification.id, n);
 n.onclose = () => {
  log.debug('browser notification onclose:', notification.id);
  browser_notifications.delete(notification.id);
  stopNotificationSound(notification);
 };
}

async function deleteBrowserNotification(id: string): Promise<void> {
 let n = browser_notifications.get(id);
 if (n) {
  log.debug('deleteBrowserNotification:', id, n);
  await n.close();
  //browser_notifications.delete(id);
 }
}

export function playNotificationSound(notification: YellowNotification): void {
 if (!get(notificationsSoundEnabled)) return;
 notification._audio = new Audio(notification.sound || 'modules/org.libersoft.messages/audio/message.mp3');
 //notification._audio = new Audio('modules/org.libersoft.messages/audio/Oxygen-Sys-Log-In-Long.ogg');
 notification._audio.play();
 if (TAURI) {
  //playAndStopExample('/usr/share/sounds/Oxygen-Sys-Log-In-Long.ogg');
 }
}

export function stopNotificationSound(notification: YellowNotification): void {
 if (notification._audio) {
  notification._audio.pause();
  //notification._audio.currentTime = 0;
 }
}

async function toPngBlob(url: string | undefined): Promise<string | undefined> {
 if (!url) {
  return undefined;
 }
 return new Promise((resolve, reject) => {
  const img = new Image(100, 100);
  img.src = url;
  img.onload = () => {
   console.log('Image loaded:', img.naturalWidth, img.naturalHeight, img.width, img.height);
   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d');
   if (ctx) {
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100); // Stretch the image to 100x100
    const res = canvas.toDataURL('image/png');
    resolve(res);
   } else {
    reject(new Error('Failed to get canvas context'));
   }
  };
  img.onerror = () => reject(new Error('Failed to load image'));
 });
}
