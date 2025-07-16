import { get, writable, type Writable } from 'svelte/store';
import { JsonRpcProvider } from 'ethers';
import { type IStatus, selectedNetwork, getSelectedRpcUrl, setSelectedRpcUrl } from '@/org.libersoft.wallet/scripts/network.ts';
import { derivedWithEquals } from '@/core/scripts/utils/derivedWithEquals.ts';
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
	if (!network) {
		status.set({ color: 'red', text: 'No network selected' });
		availableRPCURLs.set([]);
		/* TODO: chek	if this is needed
		debouncedResetBalance();
		*/
		return;
	}
	const validURLs = (network.rpcURLs || []).filter(url => !url.includes('YOUR-PROJECT-ID') && !url.includes('YOUR-API-KEY'));
	availableRPCURLs.set(validURLs);

	// Use selected RPC URL for this network
	const selectedUrl = getSelectedRpcUrl(network);
	console.log('Selected RPC URL for network:', selectedUrl);
	if (validURLs.length > 0) {
		const urlToUse = selectedUrl || validURLs[0];
		console.log('Setting RPC URL to:', urlToUse);
		rpcURL.set(urlToUse);
		// Check if selected RPC URL is saved
		if (selectedUrl && network.guid) setSelectedRpcUrl(network.guid, selectedUrl);
		connectToURL();
		return;
	} else {
		console.log('No valid RPC URLs available for network');
		status.set({ color: 'red', text: 'No valid RPC URLs available' });
		/* TODO: check	if this is needed
		debouncedResetBalance();
		*/
		return;
	}
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
	} else console.log('Reconnecting to', get(selectedNetwork));
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
		// Use selected RPC URL or first available
		const selectedUrl = getSelectedRpcUrl(net);
		rpcURL.set(selectedUrl || net.rpcURLs[0]);
	}
	connectToURL();
}

export function selectRPCURL(url: string): void {
	const net = get(selectedNetwork);
	if (!net) return;
	if (net.rpcURLs && net.rpcURLs.includes(url)) {
		rpcURL.set(url);
		// Save selected RPC URL to localStorage
		if (net.guid) setSelectedRpcUrl(net.guid, url);
	}
}
