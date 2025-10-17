import { invoke } from '@tauri-apps/api/core';
import * as app from '@tauri-apps/api';
const hasWindow = typeof window !== 'undefined';

declare global {
	interface Window {
		__TAURI__: typeof app;
	}
}

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
