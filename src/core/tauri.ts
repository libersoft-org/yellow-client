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
export const TAURI_SERVICE = hasWindow && (window as any).__TAURI_SERVICE__ === true;
export const CUSTOM_NOTIFICATIONS = TAURI && !TAURI_MOBILE;
export const IS_TAURI_DEBUG_MODE = TAURI && window.__TAURI_DEBUG_MODE__;

export const log = {
	debug: (...args: any[]) => {
		console.log(...args);
		if (hasWindow && window.__TAURI__) invoke('log', { message: formatNoColor(args) });
	},
	info: (...args: any[]) => {
		console.info(...args);
		if (hasWindow && window.__TAURI__) invoke('log', { message: formatNoColor(args), level: 'info' });
	},
	warn: (...args: any[]) => {
		console.warn(...args);
		if (hasWindow && window.__TAURI__) invoke('log', { message: formatNoColor(args), level: 'warn' });
	},
	error: (...args: any[]) => {
		console.error(...args);
		if (hasWindow && window.__TAURI__) invoke('log', { message: formatNoColor(args), level: 'error' });
	},
};

function formatNoColor(args) {
	let msg = '';
	const inspected_nocolor = args.map(o => {
		if (typeof o === 'string') return o;
		if (o instanceof Error) {
			// Handle Error objects specially to include stack trace
			return `${o.name}: ${o.message}${o.stack ? '\n' + o.stack : ''}`;
		}
		try {
			return JSON.stringify(o, null, 2);
		} catch (e) {
			// Fallback for circular references or other stringify errors
			return String(o);
		}
	});
	for (const v of inspected_nocolor) msg += v + ' ';
	return msg;
}
