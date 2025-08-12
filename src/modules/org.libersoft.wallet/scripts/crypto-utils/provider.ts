import { get, writable, type Writable } from 'svelte/store';
import { JsonRpcProvider, WebSocketProvider } from 'ethers';
import { type IStatus, selectedNetwork, getSelectedRpcUrl, setSelectedRpcUrl } from './network.ts';
import { derivedWithEquals } from './derivedWithEquals.ts';
export const status = writable<IStatus>({ color: 'red', text: 'No connection' });
export const rpcURL = writable<string | null>(null);
export const provider: Writable<JsonRpcProvider | WebSocketProvider | null> = writable<JsonRpcProvider | WebSocketProvider | null>(null);
export const availableRPCURLs = writable<string[]>([]);
let reconnectionTimer: ReturnType<typeof setTimeout> | undefined;
let isManualRpcSelection = false; // Flag to prevent automatic RPC overrides
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

export function isWebSocketUrl(url: string): boolean {
	return url.startsWith('ws://') || url.startsWith('wss://');
}

export function isValidWebSocketUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
	} catch {
		return false;
	}
}

function createProvider(url: string, chainId: number): JsonRpcProvider | WebSocketProvider {
	if (isWebSocketUrl(url)) {
		if (!isValidWebSocketUrl(url)) throw new Error('Invalid WebSocket URL format');
		return new WebSocketProvider(url, chainId);
	} else return new JsonRpcProvider(url, chainId);
}

providerData.subscribe(({ network, rpcURL: currentRpcURL }) => {
	console.log('providerData updated:', network, currentRpcURL);
	if (!network) {
		status.set({ color: 'red', text: 'No network selected' });
		availableRPCURLs.set([]);
		return;
	}
	const validURLs = (network.rpcURLs || []).filter(url => {
		if (isWebSocketUrl(url)) return isValidWebSocketUrl(url);
		return true;
	});
	availableRPCURLs.set(validURLs);

	const currentRpcUrlValue = get(rpcURL);

	// Don't override RPC URL if user manually selected one
	if (isManualRpcSelection) {
		console.log('Skipping automatic RPC selection due to manual selection');
		isManualRpcSelection = false;
		return;
	}

	// Don't override RPC URL if one is already set and is valid for this network
	if (currentRpcUrlValue && validURLs.includes(currentRpcUrlValue)) {
		console.log('Keeping current RPC URL:', currentRpcUrlValue);
		return;
	}

	console.log('providerData.subscribe: Will override RPC URL. Current:', currentRpcUrlValue, 'Valid URLs:', validURLs);

	const selectedUrl = getSelectedRpcUrl(network);
	console.log('Selected RPC URL for network:', selectedUrl);
	if (validURLs.length > 0) {
		const urlToUse = selectedUrl || validURLs[0];
		console.log('Setting RPC URL to:', urlToUse);
		rpcURL.set(urlToUse);
		if (selectedUrl && network.guid) setSelectedRpcUrl(network.guid, selectedUrl);
		connectToURL();
		return;
	} else {
		console.log('No valid RPC URLs available for network');
		status.set({ color: 'red', text: 'No valid RPC URLs available' });
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
		const isWebSocket = isWebSocketUrl(currentRpcURL);
		const connectionType = isWebSocket ? 'WebSocket' : 'HTTP';
		console.log(`Connecting to ${connectionType} RPC:`, currentRpcURL);
		status.set({ color: 'orange', text: `Connecting via ${connectionType}...` });
		const p = createProvider(currentRpcURL, net.chainID);
		provider.set(p);
		if (isWebSocket && p instanceof WebSocketProvider) console.log('WebSocket provider created');
		p.on('error', (error: Error) => {
			console.error('Provider error:', error);
			if (get(provider) === p) {
				p.destroy();
				provider.set(null);
				status.set({ color: 'red', text: 'Connection failed: ' + error.message });
			}
		});
		p.on('network', (newNetwork: any) => {
			if (get(provider) === p) {
				const connType = isWebSocket ? 'WebSocket' : 'HTTP';
				status.set({ color: 'green', text: `Connected to ${newNetwork.name} (${connType})` });
			} else console.log('Ignoring network event from old provider');
		});
		p.getNetwork()
			.then(network => {
				if (get(provider) === p) {
					console.log('Successfully connected to network:', network.name);
					const connType = isWebSocket ? 'WebSocket' : 'HTTP';
					status.set({ color: 'green', text: `Connected to ${network.name} (${connType})` });
					// Save the selected RPC URL after successful connection
					const net = get(selectedNetwork);
					const currentRpcUrlValue = get(rpcURL);
					if (net?.guid && currentRpcUrlValue) {
						setSelectedRpcUrl(net.guid, currentRpcUrlValue);
					}
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
	console.log('reconnect() called - this may override RPC URL');
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
	console.log('reconnect: Current RPC URL:', rurl);
	if (!rurl || net?.rpcURLs?.find(url => url === rurl) === undefined) {
		if (!net?.rpcURLs?.[0]) {
			status.set({
				color: 'red',
				text: 'No RPC URL found for the selected network',
			});
			return;
		}
		const selectedUrl = getSelectedRpcUrl(net);
		console.log('reconnect: Setting RPC URL to:', selectedUrl || net.rpcURLs[0]);
		rpcURL.set(selectedUrl || net.rpcURLs[0]);
	}
	connectToURL();
}

export function selectRPCURL(url: string): void {
	const net = get(selectedNetwork);
	if (!net) return;
	// Allow selection of any URL from the RPC servers list, even if not in valid rpcURLs
	// This allows testing of non-functional servers
	console.log('selectRPCURL: Setting RPC URL to:', url);
	console.log('selectRPCURL: Current RPC URL before change:', get(rpcURL));
	isManualRpcSelection = true; // Set flag to prevent automatic override
	rpcURL.set(url);
	// Save the selection immediately, regardless of connection success
	if (net.guid) {
		setSelectedRpcUrl(net.guid, url);
	}
	console.log('selectRPCURL: RPC URL set, now connecting...');
	connectToURL(); // Connect immediately
}

export async function ensureProviderConnected(): Promise<JsonRpcProvider | WebSocketProvider | null> {
	let providerInstance = get(provider);
	console.log('Initial provider check:', providerInstance);

	if (!providerInstance || Object.keys(providerInstance).length === 0) {
		console.warn('⚠️ Provider is empty, attempting to reconnect...');
		reconnect();

		// Wait for successful connection by monitoring status
		const maxWaitTime = 10000; // 10 seconds max wait
		const startTime = Date.now();

		while (Date.now() - startTime < maxWaitTime) {
			await new Promise(resolve => setTimeout(resolve, 500)); // Check every 500ms

			const currentStatus = get(status);
			providerInstance = get(provider);

			console.log('Reconnect status:', currentStatus.text, 'Provider keys:', Object.keys(providerInstance || {}));

			// Check if we have a valid provider with actual methods
			if (providerInstance && typeof providerInstance === 'object' && 'getNetwork' in providerInstance && 'getFeeData' in providerInstance && currentStatus.color === 'green') {
				console.log('✅ Provider successfully reconnected!');
				break;
			}
		}

		// Final check after wait period
		if (!providerInstance || typeof providerInstance !== 'object' || !('getNetwork' in providerInstance) || !('getFeeData' in providerInstance)) {
			console.error('❌ Provider reconnection failed or timed out!');
			throw new Error('Provider connection error - please check your network connection and try again');
		}
	}
	return providerInstance;
}
