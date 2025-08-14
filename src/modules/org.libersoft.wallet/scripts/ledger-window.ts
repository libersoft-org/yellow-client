import { get, writable } from 'svelte/store';
import { ledgerConnected } from 'libersoft-crypto/ledger';

export const ledgerWindow = writable<any>(null);

export async function toggleLedgerWindow() {
	const ledgerWin = get(ledgerWindow);
	if (!ledgerWin) {
		console.error('Ledger window is not initialized');
		return;
	}
	if (ledgerWin.isOpen()) {
		await ledgerWin.close();
	} else {
		await ledgerWin.open();
	}
}

export async function ensureLedgerState(): Promise<any> {
	if (get(ledgerConnected)) return true;

	const ledgerWin = get(ledgerWindow);
	if (!ledgerWin) {
		console.error('Ledger window is not initialized');
		return;
	}
	await ledgerWin.open();
	while (ledgerWin.isOpen()) {
		await new Promise(resolve => setTimeout(resolve, 100));
	}

	return get(ledgerConnected);
}
