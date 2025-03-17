import util from 'util';

export const IS_TAURI = Object.prototype.hasOwnProperty.call(window, '__TAURI__');
export const BROWSER = !IS_TAURI;
export const IS_TAURI_MOBILE = false;
IS_TAURI && (window.__TAURI__?.platform === 'android' || window.__TAURI__?.platform === 'ios');
export const CUSTOM_NOTIFICATIONS = IS_TAURI && !IS_TAURI_MOBILE;

export function debug(...args: any[]) {
 console.log(...args);
 window.__TAURI__?.invoke('log', { message: formatNoColor(args) });
}

function formatNoColor(args: any[]): string {
 let msg = '';
 const inspected_nocolor = args.map(o =>
  typeof o === 'string'
   ? o
   : util.inspect(o, {
      showHidden: false,
      depth: null,
      colors: false,
     })
 );
 for (const v of inspected_nocolor) {
  msg += v + ' ';
 }
 return msg;
}
