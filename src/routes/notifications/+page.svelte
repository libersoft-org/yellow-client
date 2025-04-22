<script>
 import '../../app.css';
 import Button from '@/core/components/Button/Button.svelte';
 import { writable, get } from 'svelte/store';
 import Notification from '../../core/components/Notification/Notification.svelte';
 import { getCurrentWindow, PhysicalPosition, PhysicalSize, availableMonitors } from '@tauri-apps/api/window';
 //import { moveWindow, moveWindowConstrained, Position } from '@tauri-apps/plugin-positioner';
 import { multiwindow_store } from '../../core/multiwindow_store.ts';
 import { selectedMonitorName, selectedNotificationsCorner, mainWindowMonitor } from '../../core/notifications_settings.ts';
 import { CUSTOM_NOTIFICATIONS, BROWSER, log } from '../../core/tauri.ts';
 import { onMount, onDestroy } from 'svelte';
 import { invoke } from '@tauri-apps/api/core';

 export let maxNotifications = 3;
 let notifications = writable([]);
 let counter = 0;
 let monitors = writable([]);
 let actualMonitorName = writable(null);
 let monitorInterval;
 const width = 400;
 let heightLogical = writable(100);
 let height = writable(100);

 actualMonitorName.subscribe(v => {
  log.debug('actualMonitorName:', v);
 });

 heightLogical.subscribe(async v => {
  if (BROWSER) return;
  let m = get(monitors).find(m => m.name === get(actualMonitorName));
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
 }

 monitors.subscribe(v => {
  updateNotificationsMonitor();
 });

 selectedMonitorName.subscribe(v => {
  log.debug('notifications page selectedMonitor:', v);
  updateNotificationsMonitor();
 });

 mainWindowMonitor.subscribe(v => {
  log.debug('notifications page mainWindowMonitor:', v);
  updateNotificationsMonitor();
 });

 onDestroy(() => {
  if (monitorInterval) {
   clearInterval(monitorInterval);
  }
 });

 function updateNotificationsMonitor() {
  setActualMonitorName(get(selectedMonitorName));
 }

 /*
  * Set the actual monitor name, based on selected monitor and available monitors. Set null if no monitor is available.
  */
 function setActualMonitorName(monitor_name) {
  if (monitor_name === 'main_window_monitor') {
   monitor_name = get(mainWindowMonitor);
  }

  let mons = get(monitors);
  if (!mons) {
   monitor_name = null;
  } else if (mons.find(m => m.name === monitor_name) === undefined) {
   monitor_name = mons[0]?.name;
  }
  actualMonitorName.set(monitor_name);
 }

 function getNotificationsDirection() {
  let c = get(selectedNotificationsCorner);
  if (c === 'top-right' || c === 'top-left') {
   return 'down';
  } else return 'up';
 }

 function pos(corner, mon, width, height) {
  log.debug('pos:', corner, mon, width, height);
  if (mon) {
   let x;
   let y;
   if (corner === 'top-right') {
    x = mon.right - width;
    y = mon.top;
   } else if (corner === 'top-left') {
    x = mon.left;
    y = mon.top;
   } else if (corner === 'bottom-right') {
    x = mon.right - width;
    y = mon.bottom - 1 - height;
   } else if (corner === 'bottom-left') {
    x = mon.left;
    y = mon.bottom - 1 - height;
   }
   log.debug('aaa');
   return { x, y };
  } else {
   log.debug('no monitor found');
   return {
    x: 0,
    y: 0,
   };
  }
 }

 async function updatePosition() {
  log.debug('updatePosition...');
  let h = get(height);
  const monitor_name = get(actualMonitorName);
  if (!monitor_name) {
   log.debug('actualMonitorName:', monitor_name);
   return;
  }
  let m = await invoke('get_work_area', {
   monitorName: monitor_name,
  });
  log.debug('get_work_area:', m);
  let corner = get(selectedNotificationsCorner);
  let p = pos(corner, m, width, h);
  log.debug(
   'updatePosition' +
    JSON.stringify({
     selectedNotificationsCorner: corner,
     monitor: m,
     width: width,
     height: h,
     position: p,
    })
  );
  position.set(p);
 }

 actualMonitorName.subscribe(updatePosition);
 selectedNotificationsCorner.subscribe(updatePosition);
 height.subscribe(updatePosition);

 position.subscribe(async v => {
  if (BROWSER) return;
  //log.debug('getCurrentWindow():', getCurrentWindow());
  let size = { width: 400, height: $height };
  log.debug('setPosition', v, 'size:', size);
  let w = getCurrentWindow();
  w.setPosition(new PhysicalPosition(v.x, v.y));
  w.setSize(new PhysicalSize(size.width, size.height));
  //moveWindow(Position.TrayBottomRight);
  //moveWindowConstrained(Position.TrayBottomCenter);
 });

 log.debug('/notifications');

 onMount(async () => {
  log.debug('/notifications onMount: CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS);
  if (CUSTOM_NOTIFICATIONS) {
   await initNotificationsPage();
  } else {
   log.debug('CUSTOM_NOTIFICATIONS is not defined');
  }
 });

 async function initNotificationsPage() {
  let s = await multiwindow_store('notifications', false);
  //log.debug('initNotifications: store:', s);
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
  //log.debug('notification added');
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
   {
    text: 'Abort',
    id: 'abort',
    onClick: onClick.bind(notificationData),
    expand: true,
   },
   {
    text: 'Retry',
    id: 'retry',
    onClick: onClick.bind(notificationData),
    expand: true,
   },
   {
    text: 'Fail',
    id: 'fail',
    onClick: onClick.bind(notificationData),
    expand: true,
   },
  ];
  notificationData.onClick = onClick.bind(notificationData);
  notificationData.onClose = onClose.bind(notificationData);
  notifications.update(n => [...n, notificationData]);
  log.debug('notification added');
 }

 async function onClose(e) {
  log.debug('onClose notification');
  this.onClick(e, 'close');
  onNotificationRemoved(this.id);
 }

 async function onClick(e, data) {
  e.stopPropagation();
  log.debug('onClick notification');
  await (await multiwindow_store('notification-events', false)).set(this.id, JSON.stringify(data));
  log.debug('notification event set');
 }

 async function onNotificationRemoved(id) {
  let s = await multiwindow_store('notifications', false);
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

<!--<Button text="Add notification" onClick={clickAddNotification} />-->

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
