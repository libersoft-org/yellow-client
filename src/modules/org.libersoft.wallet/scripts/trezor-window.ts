import { get, writable } from 'svelte/store';
import { trezorState } from '@/org.libersoft.wallet/scripts/crypto-utils/trezor';

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
	if (get(trezorState)) return get(trezorState);

	const trezorWin = get(trezorWindow);
	if (!trezorWin) {
		console.error('Trezor window is not initialized');
		return;
	}
	await trezorWin.open();
	while (trezorWin.isOpen()) {
		await new Promise(resolve => setTimeout(resolve, 100));
	}

	return get(trezorState);
}
