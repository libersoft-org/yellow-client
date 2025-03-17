import util from 'util';
import { invoke } from '@tauri-apps/api/core';

export const IS_TAURI = Object.prototype.hasOwnProperty.call(window, '__TAURI__');
export const BROWSER = !IS_TAURI;
export const IS_TAURI_MOBILE = false;
IS_TAURI && (window.__TAURI__?.platform === 'android' || window.__TAURI__?.platform === 'ios');
export const CUSTOM_NOTIFICATIONS = IS_TAURI && !IS_TAURI_MOBILE;

export function debug(...args: any[]) {
 console.log(...args);
 //formatNoColor(args);
 invoke('log', { message: formatNoColor(args) });
}

function formatNoColor(args) {
 let msg = '';
 const inspected_nocolor = args.map(o => (typeof o === 'string' ? o : JSON.stringify(o, null, 2)));
 for (const v of inspected_nocolor) msg += v + ' ';
 return msg;
}
