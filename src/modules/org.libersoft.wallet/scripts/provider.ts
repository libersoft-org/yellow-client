import { get, writable, type Writable } from 'svelte/store';
import { JsonRpcProvider } from 'ethers';
import { type IStatus } from '@/org.libersoft.wallet/scripts/types.ts';
import { selectedNetwork } from '@/org.libersoft.wallet/scripts/wallet.ts';
import { derivedWithEquals } from '@/core/scripts/utils/derivedWithEquals.ts';
import { balance, balanceTimestamp } from './stores';
export const status = writable<IStatus>({ color: 'red', text: 'No connection' });
export const rpcURL = writable<string | null>(null);
export const provider: Writable<JsonRpcProvider | null> = writable<JsonRpcProvider | null>(null);
export const availableRPCURLs = writable<string[]>([]);
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

providerData.subscribe(({ network, rpcURL: currentRpcURL }) => {
	console.log('providerData updated:', network, currentRpcURL);
	resetBalance();
	if (!network) {
		status.set({ color: 'red', text: 'No network selected' });
		availableRPCURLs.set([]);
		return;
	}
	const validURLs = (network.rpcURLs || []).filter(url => !url.includes('YOUR-PROJECT-ID') && !url.includes('YOUR-API-KEY'));
	availableRPCURLs.set(validURLs);
	if (!currentRpcURL || !validURLs.includes(currentRpcURL)) {
		console.log('RPC URL not valid for new network, using first available from network');
		if (validURLs.length > 0) {
			console.log('Setting RPC URL to:', validURLs[0]);
			rpcURL.set(validURLs[0]);
			return;
		} else {
			console.log('No valid RPC URLs available for network');
			status.set({ color: 'red', text: 'No valid RPC URLs available' });
			return;
		}
	}
	connectToURL();
});

function connectToURL(): void {
	const currentProvider = get(provider);
	if (currentProvider) {
		console.log('Destroying existing provider');
		currentProvider.destroy();
	}
	provider.set(null);
	const net = get(selectedNetwork);
	const currentRpcURL = get(rpcURL);
	if (!net) {
		console.error('No selected network');
		status.set({ color: 'red', text: 'No network selected' });
		return;
	}
	if (!currentRpcURL) {
		console.error('No RPC URL set');
		status.set({ color: 'red', text: 'No RPC URL set' });
		return;
	}
	status.set({ color: 'orange', text: 'Connecting...' });
	try {
		const p = new JsonRpcProvider(currentRpcURL, net.chainID);
		provider.set(p);
		p.on('error', (error: Error) => {
			console.error('Provider error:', error);
			if (get(provider) === p) {
				p.destroy();
				provider.set(null);
				status.set({ color: 'red', text: 'Connection failed: ' + error.message });
			}
		});
		p.on('network', (newNetwork: any) => {
			if (get(provider) === p) status.set({ color: 'green', text: 'Connected to ' + newNetwork.name });
			else console.log('Ignoring network event from old provider');
		});
		p.getNetwork()
			.then(network => {
				if (get(provider) === p) {
					console.log('Successfully connected to network:', network.name);
					status.set({ color: 'green', text: 'Connected to ' + network.name });
				} else console.log('Ignoring connection success from old provider');
			})
			.catch(error => {
				if (get(provider) === p) {
					console.log('Failed to connect to network:', error);
					status.set({ color: 'red', text: 'Connection failed' });
					p.destroy();
					provider.set(null);
				} else console.log('Ignoring connection error from old provider');
			});
	} catch (error) {
		console.error('Failed to create provider:', error);
		status.set({ color: 'red', text: 'Failed to create provider' });
	}
}

export function reconnect(): void {
	const currentProvider = get(provider);
	if (currentProvider) {
		console.log('Destroying existing provider for reconnect');
		currentProvider.destroy();
	}
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
