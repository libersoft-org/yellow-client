export const IS_TAURI = Object.prototype.hasOwnProperty.call(window, '__TAURI__');
export const BROWSER = !IS_TAURI;
export const IS_TAURI_MOBILE = false;
IS_TAURI && (window.__TAURI__?.platform === 'android' || window.__TAURI__?.platform === 'ios');
export const CUSTOM_NOTIFICATIONS = IS_TAURI && !IS_TAURI_MOBILE;
