import { get, writable } from 'svelte/store';
import { trezorState } from 'libersoft-crypto/trezor';

export const trezorWindow = writable<any>(null);

export async function toggleTrezorWindow() {
	const trezorWin = get(trezorWindow);
	if (!trezorWin) {
		console.error('Trezor window is not initialized');
		return;
	}
	if (trezorWin.isOpen()) {
		await trezorWin.close();
	} else {
		await trezorWin.open();
	}
}

export async function ensureTrezorState(): Promise<any> {
	if (get(trezorState)) {
		console.log('Trezor already connected');
		return get(trezorState);
	}
	console.log('Ensuring Trezor connection');

	const trezorWin = get(trezorWindow);
	if (!trezorWin) {
		console.error('Trezor window is not initialized');
		return;
	}

	console.log('Opening Trezor window...');
	try {
		await trezorWin.open();
		console.log('After trezorWin.open() - this should appear if no exception');
	} catch (error) {
		console.error('EXCEPTION in trezorWin.open():', error);
		return; // or throw error to maintain original behavior
	}

	if (!trezorWin.isOpen()) {
		console.error('Failed to open Trezor window');
		return;
	}
	console.log('Trezor window opened, waiting for it to close...');
	while (trezorWin.isOpen()) {
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	console.log('Trezor window closed, trezorState:', get(trezorState));

	return get(trezorState);
}
