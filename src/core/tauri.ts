import { invoke } from '@tauri-apps/api/core';
import * as app from '@tauri-apps/api';
import { platform } from '@tauri-apps/plugin-os';

let platformName = 'browser';
if (window.__TAURI_OS_PLUGIN_INTERNALS__) {
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

export function debug(...args: any[]) {
 console.log(...args);
 invoke('log', { message: formatNoColor(args) });
}

function formatNoColor(args) {
 let msg = '';
 const inspected_nocolor = args.map(o => (typeof o === 'string' ? o : JSON.stringify(o, null, 2)));
 for (const v of inspected_nocolor) msg += v + ' ';
 return msg;
}
