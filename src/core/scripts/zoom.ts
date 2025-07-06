import { get } from 'svelte/store';
import { zoom } from '@/core/scripts/settings.ts';
import { log, TAURI } from '@/core/scripts/tauri.ts';
import { getCurrentWebview } from '@tauri-apps/api/webview';
// import { type Event } from '@tauri-apps/api/event';

export async function setZoom() {
	if (TAURI) {
		const z = get(zoom);
		log.debug('setZoom:', z);
		await getCurrentWebview().setZoom(z);
	}
}

export async function initZoom() {
	if (TAURI) {
		let z = get(zoom);
		if (z) {
			console.log('init zoom: ', z);
			zoom.set(z);
			await setZoom();
		}
		/*
  const unlisten = await window.__TAURI__.event.listen('zoom-change', (event: Event<number>) => {
   log.debug('Zoom changed to:', event.payload);
   zoom.set(event.payload);
  });
  */
	}
}
