import { get, writable } from 'svelte/store';
import { ledgerConnected } from 'libersoft-crypto/ledger';

export const ledgerWindow = writable<any>(null);

export async function toggleLedgerWindow(): Promise<void> {
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
	if (get(ledgerConnected)) {
		console.log('Ledger already connected');
		return true;
	}

	console.log('Ensuring Ledger connection');

	const ledgerWin = get(ledgerWindow);
	if (!ledgerWin) {
		console.error('Ledger window is not initialized');
		return;
	}

	console.log('Opening Ledger window...');
	await ledgerWin.open();
	console.log('Ledger window opened, waiting for it to close...');
	const timeout = Date.now() + 60000;
	while (ledgerWin.isOpen()) {
		if (Date.now() > timeout) {
			console.error('Ledger window timed out after 60s');
			await ledgerWin.close();
			break;
		}
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	console.log('Ledger window closed, ledgerConnected:', get(ledgerConnected));

	return get(ledgerConnected);
}
