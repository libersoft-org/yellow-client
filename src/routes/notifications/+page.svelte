<script>
 import '../../app.css';
 import Button from '../../core/components/button.svelte';
 import { writable, get } from 'svelte/store';
 import Notification from '../../core/components/notification.svelte';
 import { getCurrentWindow, LogicalPosition, LogicalSize, PhysicalPosition, PhysicalSize, availableMonitors } from '@tauri-apps/api/window';

 export let maxNotifications = 3;
 let notifications = writable([]);
 let counter = 0;
 import { store } from '../../core/notifications_store.ts';
 import { selectedMonitor, selectedNotificationsCorner } from '../../core/notifications_settings.ts';
 import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER, log } from '../../core/tauri.ts';
 import { onMount, onDestroy } from 'svelte';
 import { invoke } from '@tauri-apps/api/core';

 let monitors = writable([]);
 let monitorName = writable(null);
 let monitorInterval;
 const width = 400;
 let heightLogical = writable(100);
 let height = writable(100);

 monitorName.subscribe(v => {
  log.debug('actual monitorName:', v);
 });

 heightLogical.subscribe(async v => {
  let m = get(monitors).find(m => m.name === get(monitorName));
  let scaleFactor = m?.scaleFactor;
  let scaleFactor2 = scaleFactor;
  if (!scaleFactor2) scaleFactor2 = 1;
  let h = v * scaleFactor2;
  let sss = await getCurrentWindow().scaleFactor();
  log.debug('heightLogical:', v, 'window.innerHeight:', window.innerHeight, 'scaleFactor:', scaleFactor, 'height:', h, 'getCurrent().scaleFactor():', JSON.stringify(sss));
  if (h === 0) {
   h = 10;
  }
  height.set(h);
 });
 let position = writable({ x: 0, y: 0 });

 onMount(async () => {
  if (window.__TAURI__) {
   await updateMonitors();
   monitorInterval = setInterval(async () => {
    await updateMonitors();
   }, 1000);
   invoke('get_scale_factor', {});
   invoke('show', {});
  }
 });

 async function updateMonitors() {
  //log.debug('notifications page updateMonitors');
  monitors.set(await availableMonitors());
  updateNotificationsMonitor();
 }

 monitors.subscribe(v => {
  updateNotificationsMonitor();
 });

 selectedMonitor.subscribe(v => {
  log.debug('notifications page selectedMonitor:', v);
  updateNotificationsMonitor();
 });

 onDestroy(() => {
  if (monitorInterval) {
   clearInterval(monitorInterval);
  }
 });

 function updateNotificationsMonitor() {
  let monitor_name = get(selectedMonitor);
  let mons = get(monitors);
  if (!mons) {
   monitor_name = null;
  } else if (mons.find(m => m.name === monitor_name) === undefined) {
   monitor_name = mons[0]?.name;
  }
  monitorName.set(monitor_name);
 }

 function getNotificationsDirection() {
  let c = get(selectedNotificationsCorner);
  if (c === 'top-right' || c === 'top-left') {
   return 'down';
  } else return 'up';
 }

 function pos(corner, mon, width, height) {
  if (mon && mon.size) {
   let x;
   let y;
   if (corner === 'top-right') {
    x = mon.size.width - width;
    y = 0;
   } else if (corner === 'top-left') {
    x = 0;
    y = 0;
   } else if (corner === 'bottom-right') {
    x = mon.size.width - width;
    y = mon.size.height - 1 - height;
   } else if (corner === 'bottom-left') {
    x = 0;
    y = mon.size.height - 1 - height;
   }
   return {
    x: x + mon.position.x,
    y: y + mon.position.y,
   };
  } else {
   return {
    x: 0,
    y: 0,
   };
  }
 }

 function updatePosition() {
  //log.debug('updatePosition...');
  let h = get(height);
  let m = get(monitors).find(m => m.name === get(monitorName));
  let d = getNotificationsDirection();
  let corner = get(selectedNotificationsCorner);

  let p = pos(corner, m, width, h);
  log.debug('updatePosition' + JSON.stringify({ height: h, direction: d, monitor: m, selectedNotificationsCorner: corner, position: p }));

  position.set(p);
 }

 monitorName.subscribe(updatePosition);
 selectedNotificationsCorner.subscribe(updatePosition);
 height.subscribe(updatePosition);

 position.subscribe(async v => {
  //log.debug('getCurrentWindow():', getCurrentWindow());
  let size = { width: 400, height: $height };
  //log.debug('setPosition', v, 'size:', size);
  let w = getCurrentWindow();
  w.setPosition(new PhysicalPosition(v.x, v.y));
  w.setSize(new PhysicalSize(size.width, size.height));
 });

 onMount(async () => {
  //log.debug('onMount CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS);
  if (CUSTOM_NOTIFICATIONS) {
   await initNotifications();
  } else {
   log.debug('CUSTOM_NOTIFICATIONS is not defined');
  }
 });

 async function initNotifications() {
  let s = await store('notifications', false);
  //log.debug('store:', s);
  s.onChange((k, v) => {
   //log.debug('store.onChange', k, v);
   if (!v) {
    onNotificationRemoved(k);
   } else {
    addNotification(v);
   }
  });
  s.onKeyChange((k, v) => {
   log.debug('store.onKeyChange', k, v);
  });
  //log.debug('initial store:', await s.entries());
  let values = await s.values();
  values.sort((a, b) => a.ts - b.ts);
  for (let v of values) {
   await addNotification(v);
  }
 }

 function addNotification(data) {
  //log.debug('addNotification data:', data);
  data.onClose = onClose.bind(data);
  data.onClick = onClick.bind(data);
  notifications.update(n => [...n, data]);
  log.debug('notification added');
 }

 function clickAddNotification() {
  log.debug('Clicked on add notification');
  let notificationData = {
   id: 'n' + counter,
   img: 'https://img.freepik.com/free-vector/night-ocean-landscape-full-moon-stars-shine_107791-7397.jpg',
   title: 'Very ' + counter++,
   body: 'Veřejné s autorská počítačové vyhotovení, ',
  };
  notificationData.buttons = [
   { text: 'Abort', id: 'abort', onClick: onClick.bind(notificationData), expand: true },
   { text: 'Retry', id: 'retry', onClick: onClick.bind(notificationData), expand: true },
   { text: 'Fail', id: 'fail', onClick: onClick.bind(notificationData), expand: true },
  ];
  notificationData.onClick = onClick.bind(notificationData);
  notificationData.onClose = onClose.bind(notificationData);
  notifications.update(n => [...n, notificationData]);
 }

 async function onClose(e) {
  this.onClick(e, 'close');
  onNotificationRemoved(this.id);
 }

 async function onClick(e, data) {
  e.stopPropagation();
  log.debug('Clicked on notification');
  await (await store('notification-events', false)).set(this.id, JSON.stringify(data));
  log.debug('notification event set');
 }

 async function onNotificationRemoved(id) {
  let s = await store('notifications', false);
  await s.delete(id);
  notifications.update(v => v.filter(item => item.id !== id));
  if (get(notifications).length === 0) {
   invoke('close_notifications_window', {});
  }
 }

 async function clearNotifications() {
  log.debug('clearNotifications');
  for (let n of get(notifications)) {
   await n.onClose();
  }
 }
</script>

<style>
 .notifications-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0px;
  margin: 0px;
 }

 .notifications {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .notifications.reverse {
  flex-direction: column-reverse;
 }
</style>

<div class="notifications-wrapper" bind:clientHeight={$heightLogical}>
 {#if $notifications.length >= 2}
  <Button text="Close all {$notifications.length} notifications" onClick={clearNotifications} />
 {/if}

 <div class="notifications {'reverse'}">
  {#each $notifications.slice(-maxNotifications) as n (n.id)}
   <Notification data={n} />
  {/each}
 </div>
</div>
