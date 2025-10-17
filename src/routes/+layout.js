export const ssr = false;
let p;
try {
	p = !!process.env.TAURI;
} catch (e) {
	p = false;
}
export const prerender = p;

import { log } from '@/core/scripts/tauri.ts';

function handle(event) {
	// event.error is the Error object
	console.warn('UNCAUGHT ERROR:', event);
	console.error(JSON.stringify(event, null, 2));
	console.error('Stack trace:\n', event.error?.stack);
	log.warn('UNCAUGHT ERROR:', event);
}

try {
	// @ts-ignore
	window?.addEventListener('unhandledrejection', handle);
	window?.addEventListener('error', handle);
} catch (e) {
	//log.debug('Not adding event listeners for unhandled exceptions:', e.message);
}
