import { get, writable } from 'svelte/store';
import type Window from '@/core/components/Window/Window.svelte';
import type BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
import type { IBaseSettingsInstance } from '@/core/types/settings.ts';
import { isHardwareWallet, selectedWallet } from 'libersoft-crypto/wallet';
import { ensureLedgerState } from '@/org.libersoft.wallet/scripts/ledger-window.ts';
import { ensureTrezorState } from '@/org.libersoft.wallet/scripts/trezor-window.ts';

export let section = writable<string | null>('balance');
export const settingsWindow = writable<IBaseSettingsInstance | null>(null);
export const walletsWindow = writable<IBaseSettingsInstance | null>(null);
export const rpcServersWindow = writable<Window | null>(null);
export const networksWindow = writable<Window | null>(null);

export function setSection(name: string) {
	if (get(section) !== name) section.set(name);
}

export async function ensureWalletConnection(): Promise<boolean> {
	const w = get(selectedWallet);
	if (!w) {
		console.warn('No wallet selected');
		return false;
	}
	if (!isHardwareWallet(w)) {
		console.info('Not a hardware wallet, no need to ensure connection');
		return true;
	}
	if (w.type === 'ledger') {
		return !!(await ensureLedgerState());
	} else if (w.type === 'trezor') {
		console.log('Ensuring Trezor connection for wallet:', w);
		return !!(await ensureTrezorState());
	}
	throw new Error('Unsupported hardware wallet type');
}
