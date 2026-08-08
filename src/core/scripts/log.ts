import { invoke } from '@tauri-apps/api/core';
import * as app from '@tauri-apps/api';
import { redactAll } from './redact.ts';
const hasWindow = typeof window !== 'undefined';

declare global {
	interface Window {
		__TAURI__: typeof app;
	}
}

/* Everything logged here can end up in the native log file, an exported support bundle or a Sentry
 * breadcrumb, so secrets are stripped centrally rather than trusting every call site. */
export const log = {
	debug: (...args: any[]) => {
		const safe = redactAll(args);
		console.log(...safe);
		if (hasWindow && window.__TAURI__) invoke('log', { message: formatNoColor(safe) });
	},
	info: (...args: any[]) => {
		const safe = redactAll(args);
		console.info(...safe);
		if (hasWindow && window.__TAURI__) invoke('log', { message: formatNoColor(safe), level: 'info' });
	},
	warn: (...args: any[]) => {
		const safe = redactAll(args);
		console.warn(...safe);
		if (hasWindow && window.__TAURI__) invoke('log', { message: formatNoColor(safe), level: 'warn' });
	},
	error: (...args: any[]) => {
		const safe = redactAll(args);
		console.error(...safe);
		if (hasWindow && window.__TAURI__) invoke('log', { message: formatNoColor(safe), level: 'error' });
	},
};

function formatNoColor(args): string {
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
