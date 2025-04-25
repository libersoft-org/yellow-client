import { writable, get } from 'svelte/store';
import { getCurrentWindow, PhysicalPosition, PhysicalSize, availableMonitors } from '@tauri-apps/api/window';
import { selectedMonitorName, selectedNotificationsCorner, mainWindowMonitor, notificationsSoundEnabled } from '../../core/notifications_settings.ts';
import { CUSTOM_NOTIFICATIONS, BROWSER, log } from '../../core/tauri.ts';
import { invoke } from '@tauri-apps/api/core';

let monitors = writable([]);
let actualMonitorName = writable(null);
let monitorInterval;
const width = 400;
let height = writable(100);
let position = writable({ x: 0, y: 0 });

export async function heightLogicalChanged(value) {
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
}

export async function initPositioning() {
 await updateMonitors();
 monitorInterval = setInterval(async () => {
  await updateMonitors();
 }, 1000);
 invoke('get_scale_factor', {});
}

async function deinitPositioning() {
 if (monitorInterval) {
  clearInterval(monitorInterval);
 }
}

async function updateMonitors() {
 //log.debug('notifications page updateMonitors');
 monitors.set(await availableMonitors());
}

monitors.subscribe(v => {
 log.debug('/notifications monitors:', v);
 updateNotificationsMonitor();
});

selectedMonitorName.subscribe(v => {
 log.debug('/notifications selectedMonitor:', v);
 updateNotificationsMonitor();
});

mainWindowMonitor.subscribe(v => {
 log.debug('/notifications mainWindowMonitor:', v);
 updateNotificationsMonitor();
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
  //log.debug('aaa');
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
 //log.debug('updatePosition...');
 let h = get(height);
 const monitor_name = get(actualMonitorName);
 if (!monitor_name) {
  //log.debug('actualMonitorName:', monitor_name);
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
 //log.debug('setPosition', v, 'size:', size);
 let w = getCurrentWindow();
 w.setPosition(new PhysicalPosition(v.x, v.y));
 w.setSize(new PhysicalSize(size.width, size.height));
 //moveWindow(Position.TrayBottomRight);
 //moveWindowConstrained(Position.TrayBottomCenter);
});
