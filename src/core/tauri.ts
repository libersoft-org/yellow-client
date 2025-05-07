import { invoke } from '@tauri-apps/api/core';
import * as app from '@tauri-apps/api';
import { platform } from '@tauri-apps/plugin-os';

// Check if window is defined (tests may not have window)
const hasWindow = typeof window !== 'undefined';

let platformName = 'browser';
if (hasWindow && window.__TAURI__ && window.__TAURI_OS_PLUGIN_INTERNALS__) {
 platformName = platform();
}

declare global {
 interface Window {
  __TAURI__: typeof app;
  __TAURI_DEBUG_MODE__: boolean;
 }
}

// Core constants - no imports from other modules to avoid circular dependencies
export const TAURI = hasWindow && Object.prototype.hasOwnProperty.call(window, '__TAURI__');
export const BROWSER = !TAURI;
export const TAURI_MOBILE = TAURI && (platformName === 'android' || platformName === 'ios');
export const CUSTOM_NOTIFICATIONS = TAURI && !TAURI_MOBILE;
export const IS_TAURI_DEBUG_MODE = TAURI && window.__TAURI_DEBUG_MODE__;

export const log = {
 debug: (...args: any[]) => {
  console.log(...args);
  if (hasWindow && window.__TAURI__) invoke('log', { message: formatNoColor(args) });
 },
};

function formatNoColor(args) {
 let msg = '';
 const inspected_nocolor = args.map(o => (typeof o === 'string' ? o : JSON.stringify(o, null, 2)));
 for (const v of inspected_nocolor) msg += v + ' ';
 return msg;
}
