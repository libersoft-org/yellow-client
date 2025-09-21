import * as app from '@tauri-apps/api';
import { platform } from '@tauri-apps/plugin-os';
export { log } from './log.ts';

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
export const TAURI_SERVICE = hasWindow && (window as any).__TAURI_SERVICE__ === true;
export const CUSTOM_NOTIFICATIONS = TAURI && !TAURI_MOBILE;
export const IS_TAURI_DEBUG_MODE = TAURI && window.__TAURI_DEBUG_MODE__;
