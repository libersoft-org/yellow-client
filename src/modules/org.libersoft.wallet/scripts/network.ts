import { get, writable, derived } from 'svelte/store';
import { localStorageSharedStore } from '@/lib/svelte-shared-store.ts';
import { getGuid } from '@/core/scripts/utils/utils.ts';
import { module } from '@/org.libersoft.wallet/scripts/module.ts';
export const default_networks = writable<INetwork[]>([]);
export const networks = localStorageSharedStore<INetwork[]>('networks', []);
export const selectedNetworkID = localStorageSharedStore<string | null>('selectedNetworkID', null);
export const selectedNetwork = writable<INetwork | undefined>();
export const tokenInfos = writable<Map<string, { name: string; symbol: string } | null>>(new Map());
export interface INetwork {
	guid?: string;
	name: string;
	chainID: number;
	explorerURL?: string;
	currency: ICurrency;
	rpcURLs?: string[];
	tokens?: IToken[];
	nfts?: INFT[];
	selectedRpcUrl?: string;
}
export interface ICurrency {
	name?: string;
	symbol?: string;
	contract_address?: string;
	iconURL?: string;
}
export interface IRPCServer {
	url: string;
	latency: number | null;
	lastBlock: number | null;
	blockAge: number | null;
	isAlive: boolean;
	checking?: boolean;
}
export interface ITokenData {
	contract_address: string;
	iconURL?: string;
}
export interface IToken {
	guid: string;
	item: ITokenData;
}
export interface INFTData {
	contract_address: string;
	token_id: string;
	name?: string;
	description?: string;
	image?: string;
	animation_url?: string;
	external_url?: string;
	attributes?: Array<{
		trait_type: string;
		value: string | number;
	}>;
}
export interface INFT {
	guid: string;
	item: INFTData;
}
export interface IStatus {
	color: 'red' | 'orange' | 'green';
	text: string;
}

networks.subscribe((nets: INetwork[]) => {
	let modified = false;
	for (let net of nets) {
		if (net.guid === undefined) {
			net.guid = getGuid();
			modified = true;
		}
		if (net.tokens === undefined) {
			net.tokens = [];
			modified = true;
		}
		if (net.nfts === undefined) {
			net.nfts = [];
			modified = true;
		}
		// If selectedRpcUrl is not in the list of rpcURLs, remove it
		if (net.selectedRpcUrl && net.rpcURLs && !net.rpcURLs.includes(net.selectedRpcUrl)) {
			net.selectedRpcUrl = undefined;
			modified = true;
		}
		for (let token of net.tokens) {
			if (token.guid === undefined) {
				token.guid = getGuid();
				modified = true;
			}
		}
		for (let nft of net.nfts) {
			if (nft.guid === undefined) {
				nft.guid = getGuid();
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

export async function loadDefaultNetworks(): Promise<INetwork[]> {
	const url = 'modules/' + module.identifier + '/json/networks.json';
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
		const data = await response.json();
		return data;
	} catch (error) {
		return [];
	}
}

selectedNetworkID.subscribe((value: string | null) => {
	updateSelectedNetwork(value, get(networks));
});

networks.subscribe((value: INetwork[]) => {
	updateSelectedNetwork(get(selectedNetworkID), value);
});

function updateSelectedNetwork(selectedNetworkID: string | null, networks: INetwork[]): void {
	const r = networks.find(n => n.guid === selectedNetworkID);
	if (r === get(selectedNetwork)) return;
	/* TODO: check if this is needed
	hasInitializedBalance = false;
	*/
	selectedNetwork.set(r);
}

export function addNetwork(net: INetwork): boolean {
	if (get(networks)?.find(n => n.name === net.name)) return false;
	const my_net: INetwork = {
		guid: getGuid(),
		name: net.name,
		chainID: net.chainID,
		currency: {
			...(net.currency.symbol && { symbol: net.currency.symbol }),
			...(net.currency.iconURL && { iconURL: net.currency.iconURL }),
		},
		explorerURL: net.explorerURL,
		rpcURLs: net.rpcURLs?.map(url => url),
		tokens: [],
	};
	networks.update(n => {
		n.push(my_net);
		return n;
	});
	return true;
}

export function editNetwork(net: INetwork): void {
	networks.update(networks => {
		const index = networks.findIndex(n => n.guid === net.guid);
		if (index !== -1) networks[index] = net;
		return networks;
	});
}

export function deleteNetwork(net: INetwork): void {
	console.log('Deleting network:', net);
	console.log('Current networks:', get(networks));
	networks.update(n => {
		return n.filter(item => {
			//console.log('Checking network:', item.guid, 'against', net.guid);
			return item.guid !== net.guid;
		});
	});
}

export function addToken(networkGuid: string, token: IToken): void {
	networks.update(networks => {
		return networks.map(network => {
			if (network.guid === networkGuid) {
				return {
					...network,
					tokens: [...(network.tokens || []), token],
				};
			}
			return network;
		});
	});
}

export function editToken(networkGuid: string, token: IToken): void {
	networks.update(networks => {
		return networks.map(network => {
			if (network.guid === networkGuid) {
				return {
					...network,
					tokens: network.tokens?.map(t => (t.guid === token.guid ? token : t)) || [],
				};
			}
			return network;
		});
	});
}

export let tokens = derived([selectedNetwork], ([$selectedNetwork]) => {
	return ($selectedNetwork?.tokens || []).map(token => ({
		guid: token.guid,
		contract_address: token.item?.contract_address,
		iconURL: token.item?.iconURL,
	}));
});

export let nfts = derived([selectedNetwork], ([$selectedNetwork]) => {
	return ($selectedNetwork?.nfts || []).map(nft => ({
		guid: nft.guid,
		contract_address: nft.item?.contract_address,
		token_id: nft.item?.token_id,
		name: nft.item?.name,
		description: nft.item?.description,
		image: nft.item?.image,
		animation_url: nft.item?.animation_url,
		external_url: nft.item?.external_url,
		attributes: nft.item?.attributes,
	}));
});

export let currencies = derived([selectedNetwork, tokens, tokenInfos], ([$selectedNetwork, $tokens, $tokenInfos]) => {
	const currencyList: ICurrency[] = [];
	// Add native currency
	if ($selectedNetwork?.currency?.symbol) {
		currencyList.push({
			symbol: $selectedNetwork.currency.symbol,
			iconURL: $selectedNetwork.currency.iconURL,
		});
	}
	// Add tokens
	if ($tokens && $tokens.length > 0) {
		$tokens.forEach(token => {
			if (token.contract_address) {
				const tokenInfo = $tokenInfos.get(token.contract_address);
				const symbol = tokenInfo?.symbol || token.contract_address.slice(0, 8) + '...';
				currencyList.push({
					symbol: symbol,
					iconURL: token.iconURL,
					contract_address: token.contract_address,
				});
			}
		});
	}
	return currencyList;
});

export function deleteToken(networkGuid: string, tokenGuid: string): void {
	networks.update(networks => {
		return networks.map(network => {
			if (network.guid === networkGuid) {
				return {
					...network,
					tokens: (network.tokens || []).filter(t => t.guid !== tokenGuid),
				};
			}
			return network;
		});
	});
}

export function updateTokenInfo(contractAddress: string, tokenInfo: { name: string; symbol: string } | null): void {
	tokenInfos.update(map => {
		const newMap = new Map(map);
		newMap.set(contractAddress, tokenInfo);
		return newMap;
	});
}

export function reorderTokens(networkGuid: string, reorderedTokens: IToken[]): void {
	networks.update(networks => {
		return networks.map(network => {
			if (network.guid === networkGuid) {
				return {
					...network,
					tokens: reorderedTokens,
				};
			}
			return network;
		});
	});
}

export function setSelectedRpcUrl(networkGuid: string, rpcUrl: string): void {
	networks.update(networks => {
		return networks.map(network => {
			if (network.guid === networkGuid) {
				return {
					...network,
					selectedRpcUrl: rpcUrl,
				};
			}
			return network;
		});
	});
}

export function getSelectedRpcUrl(network: INetwork): string | undefined {
	// Return stored selected RPC URL even if it's not in the valid list anymore
	// This allows keeping user's selection of non-functional servers for testing
	if (network.selectedRpcUrl) return network.selectedRpcUrl;
	// Otherwise return the first available RPC URL
	return network.rpcURLs?.[0];
}

export function initializeDefaultNetworks(): void {
	//console.log('initializeDefaultNetworks() called');
	if (get(default_networks).length > 0) {
		//console.log('Default networks already loaded');
		return;
	}

	loadDefaultNetworks()
		.then(networks => {
			//console.log('loadDefaultNetworks() resolved with:', networks.length, 'networks');
			default_networks.set(
				networks.map(network => ({
					...network,
					guid: getGuid(),
					tokens: network.tokens || [],
				}))
			);
			//console.log('default_networks store updated');
			initializeNetworksIfNeeded();
		})
		.catch(error => {
			console.error('loadDefaultNetworks() failed:', error);
		});
}

async function initializeNetworksIfNeeded(): Promise<void> {}

export function generateUniqueNetworkName(baseName: string): string {
	const existingNetworks = get(networks);
	let counter = 1;
	let newName = `${baseName} (${counter})`;
	while (existingNetworks.find(n => n.name === newName)) {
		counter++;
		newName = `${baseName} (${counter})`;
	}
	return newName;
}

export function replaceAllNetworks(networksData: any[]): void {
	const networksWithGuids = networksData.map((network: any) => {
		if (!network.guid) return { ...network, guid: getGuid() };
		return network;
	});
	networks.set(networksWithGuids);
}

export function addNetworkIfNotExists(network: any): boolean {
	const existingNetworks = get(networks);
	const exists = existingNetworks.find(n => n.name === network.name);
	if (!exists) {
		if (!network.guid) network.guid = getGuid();
		networks.update(current => [...current, network]);
		return true;
	}
	return false;
}

export function replaceExistingNetwork(networkToReplace: any): void {
	networks.update(current => {
		return current.map(network => {
			if (network.name === networkToReplace.name) return { ...networkToReplace, guid: network.guid };
			return network;
		});
	});
}

export function addNetworkWithUniqueName(network: any): void {
	const uniqueName = generateUniqueNetworkName(network.name);
	const networkWithUniqueName = { ...network, name: uniqueName, guid: getGuid() };
	networks.update(current => [...current, networkWithUniqueName]);
}

export function hasNetworkWithName(name: string): boolean {
	return get(networks).some(n => n.name === name);
}

export function addSingleNetwork(network: any): void {
	if (!network.guid) network.guid = getGuid();
	networks.update(current => [...current, network]);
}

export function findNetworkByName(name: string): any | undefined {
	const existingNetworks = get(networks);
	return existingNetworks.find(n => n.name === name);
}

export function findNetworkByGuid(guid: string): INetwork | undefined {
	const existingNetworks = get(networks);
	return existingNetworks.find(n => n.guid === guid);
}

export function checkIfNetworksExist(): boolean {
	return get(networks).length > 0;
}

export async function checkRPCServer(server: IRPCServer): Promise<void> {
	server.checking = true;
	const startTime = Date.now();
	try {
		const isWebSocket = server.url.startsWith('ws://') || server.url.startsWith('wss://');
		if (isWebSocket) await checkWebSocketRPCServer(server, startTime);
		else await checkHTTPRPCServer(server, startTime);
	} catch (error) {
		console.error('Error checking RPC server ' + server.url + ':', error);
		server.latency = null;
		server.lastBlock = null;
		server.blockAge = null;
		server.isAlive = false;
	} finally {
		server.checking = false;
	}
}

async function checkHTTPRPCServer(server: IRPCServer, startTime: number): Promise<void> {
	const blockNumberResponse = await fetch(server.url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			jsonrpc: '2.0',
			method: 'eth_blockNumber',
			params: [],
			id: 1,
		}),
		signal: AbortSignal.timeout(10000),
	});
	if (!blockNumberResponse.ok) throw new Error('HTTP ' + blockNumberResponse.status + ': ' + blockNumberResponse.statusText);
	const blockNumberData = await blockNumberResponse.json();
	if (blockNumberData.error) throw new Error('RPC Error: ' + blockNumberData.error.message);
	const blockNumber = parseInt(blockNumberData.result, 16);
	let blockAge: number | null = null;
	try {
		const blockResponse = await fetch(server.url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				jsonrpc: '2.0',
				method: 'eth_getBlockByNumber',
				params: [blockNumberData.result, false],
				id: 2,
			}),
			signal: AbortSignal.timeout(5000),
		});
		if (blockResponse.ok) {
			const blockData = await blockResponse.json();
			if (!blockData.error && blockData.result && blockData.result.timestamp) {
				const blockTimestamp = parseInt(blockData.result.timestamp, 16);
				const currentTime = Math.floor(Date.now() / 1000);
				blockAge = currentTime - blockTimestamp;
			}
		}
	} catch (blockError) {
		console.warn('Could not get block details for ' + server.url + ':', blockError);
	}
	const endTime = Date.now();
	server.latency = endTime - startTime;
	server.lastBlock = blockNumber;
	server.blockAge = blockAge;
	server.isAlive = true;
}

async function checkWebSocketRPCServer(server: IRPCServer, startTime: number): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const ws = new WebSocket(server.url);
		let resolved = false;
		let blockNumber: number | null = null;
		let blockAge: number | null = null;
		const cleanup = () => {
			if (ws.readyState === WebSocket.OPEN) ws.close();
		};
		const timeout = setTimeout(() => {
			if (!resolved) {
				resolved = true;
				cleanup();
				reject(new Error('WebSocket connection timeout'));
			}
		}, 10000);
		ws.onopen = () => {
			ws.send(
				JSON.stringify({
					jsonrpc: '2.0',
					method: 'eth_blockNumber',
					params: [],
					id: 1,
				})
			);
		};
		ws.onmessage = async event => {
			try {
				const data = JSON.parse(event.data);
				if (data.id === 1) {
					if (data.error) throw new Error('RPC error: ' + data.error.message);
					blockNumber = parseInt(data.result, 16);
					ws.send(
						JSON.stringify({
							jsonrpc: '2.0',
							method: 'eth_getBlockByNumber',
							params: [data.result, false],
							id: 2,
						})
					);
				} else if (data.id === 2) {
					if (!data.error && data.result && data.result.timestamp) {
						const blockTimestamp = parseInt(data.result.timestamp, 16);
						const currentTime = Math.floor(Date.now() / 1000);
						blockAge = currentTime - blockTimestamp;
					}
					if (!resolved) {
						resolved = true;
						clearTimeout(timeout);
						const endTime = Date.now();
						server.latency = endTime - startTime;
						server.lastBlock = blockNumber;
						server.blockAge = blockAge;
						server.isAlive = true;
						cleanup();
						resolve();
					}
				}
			} catch (error) {
				if (!resolved) {
					resolved = true;
					clearTimeout(timeout);
					cleanup();
					reject(error);
				}
			}
		};
		ws.onerror = error => {
			if (!resolved) {
				resolved = true;
				clearTimeout(timeout);
				cleanup();
				reject(new Error('WebSocket error: ' + error));
			}
		};
		ws.onclose = event => {
			if (!resolved) {
				resolved = true;
				clearTimeout(timeout);
				if (event.code !== 1000) reject(new Error('WebSocket closed with code ' + event.code + ': ' + event.reason));
			}
		};
	});
}

export async function checkAllRPCServers(servers: IRPCServer[]): Promise<void> {
	const promises = servers.map(server => checkRPCServer(server));
	await Promise.all(promises);
}

export function formatLatency(latency: number | null): string {
	if (latency === null) return 'N/A';
	return latency + 'ms';
}

export function formatBlockNumber(blockNumber: number | null): string {
	if (blockNumber === null) return 'N/A';
	return blockNumber.toLocaleString();
}

export function formatBlockAge(blockAge: number | null): string {
	if (blockAge === null) return 'N/A';
	if (blockAge < 60) return blockAge + 's ago';
	else if (blockAge < 3600) {
		const minutes = Math.floor(blockAge / 60);
		return minutes + 'm ago';
	} else if (blockAge < 86400) {
		const hours = Math.floor(blockAge / 3600);
		const minutes = Math.floor((blockAge % 3600) / 60);
		return hours + 'h ' + minutes + 'm ago';
	} else {
		const days = Math.floor(blockAge / 86400);
		const hours = Math.floor((blockAge % 86400) / 3600);
		return days + 'd ' + hours + 'h ago';
	}
}

export function getRPCServersFromNetwork(network: INetwork): IRPCServer[] {
	if (!network?.rpcURLs) return [];
	return network.rpcURLs.map(url => ({
		url,
		latency: null,
		lastBlock: null,
		blockAge: null,
		isAlive: false,
		checking: false,
	}));
}

export function reorderNetworks(reorderedNetworks: INetwork[]): void {
	networks.set(reorderedNetworks);
}

export function addNFT(networkGuid: string, nftData: INFTData): void {
	networks.update(nets => {
		const net = nets.find(n => n.guid === networkGuid);
		if (!net) return nets;
		if (!net.nfts) net.nfts = [];
		const newNft: INFT = {
			guid: getGuid(),
			item: nftData,
		};
		net.nfts.push(newNft);
		return nets;
	});
}

export function deleteNFT(networkGuid: string, nftGuid: string): void {
	networks.update(nets => {
		const net = nets.find(n => n.guid === networkGuid);
		if (!net?.nfts) return nets;
		net.nfts = net.nfts.filter(nft => nft.guid !== nftGuid);
		return nets;
	});
}

export function editNFT(networkGuid: string, nftGuid: string, nftData: INFTData): void {
	networks.update(nets => {
		const net = nets.find(n => n.guid === networkGuid);
		if (!net?.nfts) return nets;
		const nft = net.nfts.find(n => n.guid === nftGuid);
		if (nft) {
			nft.item = nftData;
		}
		return nets;
	});
}

export function reorderNFTs(networkGuid: string, reorderedNFTs: INFT[]): void {
	networks.update(networks => {
		return networks.map(network => {
			if (network.guid === networkGuid) {
				return {
					...network,
					nfts: reorderedNFTs,
				};
			}
			return network;
		});
	});
}
