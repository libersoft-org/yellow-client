import { get, writable, type Writable } from 'svelte/store';
import { formatEther, getIndexedAccountPath, HDNodeWallet, JsonRpcProvider, Mnemonic, randomBytes, type PreparedTransactionRequest } from 'ethers';
import type { IStatus } from '@/org.libersoft.wallet/scripts/types.ts';
import { selectedNetwork } from '@/org.libersoft.wallet/scripts/wallet.ts';
import { derivedWithEquals } from '@/core/scripts/utils/derivedWithEquals.ts';
import { balance, balanceTimestamp } from './stores';

export const status = writable<IStatus>({ color: 'red', text: 'Started.' });
export const rpcURL = writable<string | null>(null);
export const provider: Writable<JsonRpcProvider | null> = writable<JsonRpcProvider | null>(null);

const WALLET_PROVIDER_RECONNECT_INTERVAL = import.meta.env.VITE_YELLOW_CLIENT_WALLET_PROVIDER_RECONNECT_INTERVAL || 10000;
let reconnectionTimer: ReturnType<typeof setTimeout> | undefined;

let providerData = derivedWithEquals(
	[selectedNetwork, rpcURL],
	([$selectedNetwork, $rpcURL]) => {
		return {
			network: $selectedNetwork,
			rpcURL: $rpcURL,
		};
	},
	(a, b) => {
		return a?.network?.guid === b?.network?.guid && a?.rpcURL === b?.rpcURL;
	}
);

providerData.subscribe(({ network, rpcURL }) => {
	console.log('providerData updated:', network, rpcURL);
	resetBalance();
	if (!network || !rpcURL) {
		console.log('No network or rpcURL.');
		return;
	}
	reconnect();
});

function reconnect(): void {
	provider.set(null);

	const net = get(selectedNetwork);
	if (!net) {
		console.log('No selected network to reconnect');
		return;
	} else {
		console.log('Reconnecting to', get(selectedNetwork));
	}

	status.set({ color: 'orange', text: 'Connecting to ' + net.name });
	if (reconnectionTimer !== undefined) clearTimeout(reconnectionTimer);

	const rurl = get(rpcURL);
	if (!rurl || net?.rpcURLs?.find(url => url === rurl) === undefined) {
		if (!net?.rpcURLs?.[0]) {
			status.set({
				color: 'red',
				text: 'No RPC URL found for the selected network',
			});
			return;
		}
		rpcURL.set(net.rpcURLs[0]);
	}
	connectToURL();
}

function connectToURL(): void {
	console.log('Connecting to', get(rpcURL));
	const net = get(selectedNetwork);
	if (!net) {
		console.error('No selected network');
		return;
	}
	const p = new JsonRpcProvider(get(rpcURL)!, net.chainID);
	provider.set(p);
	p.on('error', (error: Error) => {
		console.log('Provider error:', error);
		const p = get(provider);
		if (p) p.destroy();
		provider.set(null);
		setNextUrl();
		reconnectionTimer = setTimeout(reconnect, WALLET_PROVIDER_RECONNECT_INTERVAL);
	});
	p.on('network', (newNetwork: any) => {
		console.log('Network changed:', newNetwork.toJSON());
		status.set({ color: 'green', text: 'Connected: ' + newNetwork.name });
	});
}

function setNextUrl(): void {
	const net = get(selectedNetwork);
	if (!net?.rpcURLs) return;
	let i = net.rpcURLs.indexOf(get(rpcURL) || '');
	i += 1;
	let url: string;
	if (i >= net.rpcURLs.length) url = net.rpcURLs[0];
	else url = net.rpcURLs[i];
	rpcURL.set(url);
	status.set({ color: 'orange', text: 'Trying next url: ' + url });
}

function resetBalance(): void {
	console.log('resetBalance');
	balance.set({
		crypto: {
			amount: '?',
			currency: get(selectedNetwork)?.currency.symbol || '?',
		},
		fiat: { amount: '?', currency: 'USD' },
	});
	balanceTimestamp.set(null);
}

status.subscribe((value: IStatus) => {
	console.log('wallet.ts Status updated:', value);
});
