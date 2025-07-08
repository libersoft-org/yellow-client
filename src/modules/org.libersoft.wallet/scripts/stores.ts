import { getGuid } from '@/core/scripts/utils/utils';
import { localStorageSharedStore } from '@/lib/svelte-shared-store.ts';
import type { IBalance, INetwork, IWallet } from '@/modules/org.libersoft.wallet/scripts/types.ts';
import { derived, writable } from 'svelte/store';

export const networks = localStorageSharedStore<INetwork[]>('networks', []);

networks.subscribe((nets: INetwork[]) => {
	let modified = false;
	for (let net of nets) {
		// Ensure each network has a unique GUID and tokens array - migration from old format?
		if (net.guid === undefined) {
			net.guid = getGuid();
			modified = true;
		}
		if (net.tokens === undefined) {
			net.tokens = [];
			modified = true;
		}
		for (let token of net.tokens) {
			if (token.guid === undefined) {
				token.guid = getGuid();
				modified = true;
			}
		}
	}
	if (modified) {
		setTimeout(() => {
			networks.update(n => n);
		}, 100);
	}
});

export const wallets = localStorageSharedStore<IWallet[]>('wallets', []);
export const selectedWalletID = localStorageSharedStore<string | null>('selectedWalletID', null);
export const selectedWallet = derived([wallets, selectedWalletID], ([$wallets, $selectedWalletID]) => {
	const r = $wallets.find(w => w.address === $selectedWalletID);
	return r;
});

wallets.subscribe((wals: IWallet[]) => {
	while (wallets_cleanup(wals)) {
		wallets.update(w => w);
	}
});

function wallets_cleanup(wallets: any) {
	for (let i = 0; i < wallets.length; i++) {
		for (let j = 0; j < wallets.length; j++) {
			if (i !== j && wallets[i].address === wallets[j].address) {
				console.error('Wallet with address ' + wallets[i].address + ' already exists');
				wallets.splice(i, 1);
				return true;
			}
			if (i !== j && wallets[i].phrase === wallets[j].phrase) {
				console.error('Wallet with phrase ' + wallets[i].phrase + ' already exists');
				wallets.splice(i, 1);
				return true;
			}
		}
	}
}

export const selectedNetworkID = localStorageSharedStore<string | null>('selectedNetworkID', null);
export const selectedNetwork = writable<INetwork | undefined>();

export const selectedAddress = derived([selectedWallet], ([$selectedWallet]) => {
	let addresses = $selectedWallet?.addresses || [];
	let result = addresses.find(a => a.index === $selectedWallet?.selected_address_index);
	return result;
});

export const balance = writable<IBalance>({
	crypto: {
		amount: '?',
		currency: 'N/A',
	},
	fiat: {
		amount: '?',
		currency: 'USD',
	},
});

balance.subscribe((value: IBalance) => {
	console.log('balance:', value);
});

export const balanceTimestamp = writable<Date | null>(null);
