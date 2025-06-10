export const ssr = false;
let p;
try {
	p = !!process.env.TAURI;
} catch (e) {
	p = false;
}
export const prerender = p;

import { log } from '@/core/tauri';

function handle(event) {
	// event.error is the Error object
	console.warn('UNCAUGHT ERROR:', event);
	console.error(JSON.stringify(event, null, 2));
	log.warn('UNCAUGHT ERROR:', event);
}

try {
	// @ts-ignore
	window?.addEventListener('unhandledrejection', handle);
	window?.addEventListener('error', handle);
} catch (e) {}
