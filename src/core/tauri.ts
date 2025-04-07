import { invoke } from '@tauri-apps/api/core';
import * as app from '@tauri-apps/api';
import { platform } from '@tauri-apps/plugin-os';
import { currentMonitor, getCurrentWindow, PhysicalSize } from '@tauri-apps/api/window';

let platformName = 'browser';
if (window.__TAURI__ && window.__TAURI_OS_PLUGIN_INTERNALS__) {
 platformName = platform();
}

declare global {
 interface Window {
  __TAURI__: typeof app;
 }
}

export const IS_TAURI = Object.prototype.hasOwnProperty.call(window, '__TAURI__');
export const BROWSER = !IS_TAURI;
export const IS_TAURI_MOBILE = IS_TAURI && (platformName === 'android' || platformName === 'ios');
export const CUSTOM_NOTIFICATIONS = IS_TAURI && !IS_TAURI_MOBILE;

export const log = {
 debug: (...args: any[]) => {
  console.log(...args);
  if (window.__TAURI__) invoke('log', { message: formatNoColor(args) });
 },
};

function formatNoColor(args) {
 let msg = '';
 const inspected_nocolor = args.map(o => (typeof o === 'string' ? o : JSON.stringify(o, null, 2)));
 for (const v of inspected_nocolor) msg += v + ' ';
 return msg;
}

export async function setDefaultWindowSize() {
 if (!IS_TAURI || IS_TAURI_MOBILE) {
  return;
 }
 let w = getCurrentWindow();
 const size = await getCurrentWindow().innerSize();
 log.debug('size', size);
 if (size.width === 500 && size.height === 500) {
  log.debug('setting default size');
  const monitor_size = (await currentMonitor()).size;
  let new_size = new PhysicalSize(monitor_size.width * 0.8, monitor_size.height * 0.8);
  await w.setSize(new_size);
  await w.center();
 }
}
