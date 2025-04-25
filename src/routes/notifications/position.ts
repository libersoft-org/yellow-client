import { writable, get, type Writable } from 'svelte/store';
import { getCurrentWindow, PhysicalPosition, PhysicalSize, availableMonitors, type Monitor } from '@tauri-apps/api/window';
import { selectedMonitorName, selectedNotificationsCorner, mainWindowMonitor, notificationsSoundEnabled } from '../../core/notifications_settings.ts';
import { CUSTOM_NOTIFICATIONS, BROWSER, log } from '../../core/tauri.ts';
import { invoke } from '@tauri-apps/api/core';

type Position = {
 x: number;
 y: number;
};

type WorkArea = {
 top: number;
 left: number;
 bottom: number;
 right: number;
};

type Corner = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
type Direction = 'up' | 'down';

const monitors: Writable<Monitor[]> = writable([]);
const actualMonitorName: Writable<string | null> = writable(null);
let monitorInterval: Timer | undefined;
const width = 400;
const height: Writable<number> = writable(100);
const position: Writable<Position> = writable({ x: 0, y: 0 });

export async function heightLogicalChanged(value: number): Promise<void> {
 if (BROWSER) return;
 const m = get(monitors).find(m => m.name === get(actualMonitorName));
 const scaleFactor = m?.scaleFactor;
 let scaleFactor2 = scaleFactor;
 if (!scaleFactor2) scaleFactor2 = 1;
 let h = value * scaleFactor2;
 const sss = await getCurrentWindow().scaleFactor();
 //log.debug('heightLogical:', value, 'window.innerHeight:', window.innerHeight, 'scaleFactor:', scaleFactor, 'height:', h, 'getCurrent().scaleFactor():', JSON.stringify(sss));
 if (h === 0) {
  h = 10;
 }
 height.set(h);
}

export async function initPositioning(): Promise<void> {
 await updateMonitors();
 monitorInterval = setInterval(async () => {
  await updateMonitors();
 }, 1000);
 invoke('get_scale_factor', {});
}

export async function deinitPositioning(): Promise<void> {
 if (monitorInterval) {
  clearInterval(monitorInterval);
 }
}

async function updateMonitors(): Promise<void> {
 //log.debug('notifications page updateMonitors');
 monitors.set(await availableMonitors());
}

monitors.subscribe(v => {
 //log.debug('/notifications monitors:', v);
 updateNotificationsMonitor();
});

selectedMonitorName.subscribe(v => {
 //log.debug('/notifications selectedMonitor:', v);
 updateNotificationsMonitor();
});

mainWindowMonitor.subscribe(v => {
 //log.debug('/notifications mainWindowMonitor:', v);
 updateNotificationsMonitor();
});

function updateNotificationsMonitor(): void {
 setActualMonitorName(get(selectedMonitorName));
}

/*
 * Set the actual monitor name, based on selected monitor and available monitors. Set null if no monitor is available.
 */
function setActualMonitorName(monitor_name: string | null): void {
 if (monitor_name === 'main_window_monitor') {
  monitor_name = get(mainWindowMonitor);
 }

 const mons = get(monitors);
 if (!mons) {
  monitor_name = null;
 } else if (mons.find(m => m.name === monitor_name) === undefined) {
  monitor_name = mons[0]?.name;
 }
 actualMonitorName.set(monitor_name);
}

function getNotificationsDirection(): Direction {
 const c = get(selectedNotificationsCorner);
 if (c === 'top-right' || c === 'top-left') {
  return 'down';
 } else return 'up';
}

function pos(corner: Corner, mon: WorkArea, width: number, height: number): Position {
 //log.debug('pos:', corner, mon, width, height);
 if (mon) {
  let x: number;
  let y: number;
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
  } else throw new Error('Invalid corner: ' + corner);
  //log.debug('aaa');
  return { x, y };
 } else {
  //log.debug('no monitor found');
  return {
   x: 0,
   y: 0,
  };
 }
}

async function updatePosition(): Promise<void> {
 //log.debug('updatePosition...');
 const h = get(height);
 const monitor_name = get(actualMonitorName);
 if (!monitor_name) {
  //log.debug('actualMonitorName:', monitor_name);
  return;
 }
 const m = await invoke<WorkArea>('get_work_area', {
  monitorName: monitor_name,
 });
 //log.debug('get_work_area:', m);
 const corner = get(selectedNotificationsCorner) as Corner;
 const p = pos(corner, m, width, h);
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
 const size = { width: 400, height: get(height) };
 //log.debug('setPosition', v, 'size:', size);
 const w = getCurrentWindow();
 w.setPosition(new PhysicalPosition(v.x, v.y));
 w.setSize(new PhysicalSize(size.width, size.height));
 //moveWindow(Position.TrayBottomRight);
 //moveWindowConstrained(Position.TrayBottomCenter);
});
