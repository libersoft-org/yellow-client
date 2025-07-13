import { derived, get, writable } from 'svelte/store';
import { formatEther, getIndexedAccountPath, HDNodeWallet, JsonRpcProvider, Mnemonic, randomBytes, type PreparedTransactionRequest, Contract, formatUnits } from 'ethers';
import { module } from '@/org.libersoft.wallet/scripts/module.ts';
import { provider, status, reconnect, availableRPCURLs, rpcURL } from '@/org.libersoft.wallet/scripts/provider.ts';
import type { IAddress, IBalance, INetwork, IStatus, IWallet, IToken, IRPCServer, ITokenBalance } from '@/org.libersoft.wallet/scripts/types.ts';
import { getGuid } from '@/core/scripts/utils/utils.ts';
export type { IAddress, IBalance, INetwork, IStatus, IWallet, IToken, IRPCServer, ITokenBalance } from '@/org.libersoft.wallet/scripts/types.ts';
import { balance, balanceTimestamp, networks, selectedAddress, selectedWallet, selectedWalletID, selectedNetwork, selectedNetworkID, wallets, tokenBalances } from '@/org.libersoft.wallet/scripts/stores.ts';
export { balance, balanceTimestamp, networks, selectedAddress, selectedWallet, selectedWalletID, selectedNetwork, selectedNetworkID, wallets, tokenBalances } from '@/org.libersoft.wallet/scripts/stores.ts';
export { status, rpcURL, provider, reconnect, availableRPCURLs } from '@/org.libersoft.wallet/scripts/provider.ts';
export let section = writable<string | null>('balance');
export const settingsWindow = writable<any>();
export const walletsWindow = writable<any>();
export const rpcServersWindow = writable<any>();
export let sendAddress = writable<string | number | undefined>();
export const default_networks = writable<INetwork[]>([]);
let balanceRefreshInterval: ReturnType<typeof setInterval> | null = null;
const BALANCE_REFRESH_INTERVAL = 30000;
let isRefreshing = false;
let hasInitializedBalance = false;

function startBalanceRefreshTimer(): void {
	if (balanceRefreshInterval) clearInterval(balanceRefreshInterval);
	balanceRefreshInterval = setInterval(() => {
		if (get(selectedNetwork) && get(selectedAddress) && get(provider) && !isRefreshing) {
			refreshAllBalances();
		}
	}, BALANCE_REFRESH_INTERVAL);
}

function stopBalanceRefreshTimer(): void {
	if (balanceRefreshInterval) {
		clearInterval(balanceRefreshInterval);
		balanceRefreshInterval = null;
	}
}

async function refreshAllBalances(): Promise<void> {
	if (isRefreshing) return;
	isRefreshing = true;
	try {
		await getBalance();
		await getTokenBalances();
	} finally {
		isRefreshing = false;
	}
}

async function loadDefaultNetworks(): Promise<INetwork[]> {
	const url = '/modules/' + module.identifier + '/json/networks.json';
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

selectedNetwork.subscribe(network => {
	if (network && get(selectedAddress) && get(provider)) {
		if (!hasInitializedBalance) {
			hasInitializedBalance = true;
			refreshAllBalances();
		}
		startBalanceRefreshTimer();
	} else {
		hasInitializedBalance = false;
		stopBalanceRefreshTimer();
	}
});

selectedAddress.subscribe(address => {
	if (address && get(selectedNetwork) && get(provider)) {
		if (!hasInitializedBalance) {
			hasInitializedBalance = true;
			refreshAllBalances();
		}
		startBalanceRefreshTimer();
	} else {
		hasInitializedBalance = false;
		stopBalanceRefreshTimer();
	}
});

provider.subscribe(p => {
	if (p && get(selectedNetwork) && get(selectedAddress)) {
		if (!hasInitializedBalance) {
			hasInitializedBalance = true;
			refreshAllBalances();
		}
		startBalanceRefreshTimer();
	} else {
		hasInitializedBalance = false;
		stopBalanceRefreshTimer();
	}
});

function updateSelectedNetwork(selectedNetworkID: string | null, networks: INetwork[]): void {
	const r = networks.find(n => n.guid === selectedNetworkID);
	if (r === get(selectedNetwork)) return;
	hasInitializedBalance = false;
	selectedNetwork.set(r);
}

export const selectedMainCurrencySymbol = derived([selectedNetwork], ([$selectedNetwork]) => {
	return $selectedNetwork?.currency.symbol;
});
export let tokens = derived([selectedNetwork], ([$selectedNetwork]) => {
	return ($selectedNetwork?.tokens || []).map(token => ({
		symbol: token.symbol,
		icon: token.icon,
		name: token.name,
		contract_address: token.contract_address,
		guid: token.guid,
	}));
});
export let currencies = derived([tokens, selectedMainCurrencySymbol], ([$tokens, $selectedMainCurrencySymbol]) => {
	return [$selectedMainCurrencySymbol, ...$tokens.map(token => token.symbol)].filter((currency): currency is string => currency !== undefined);
});

export function setSection(name: string) {
	if (get(section) !== name) section.set(name);
}

export function setSendAddress(address: string) {
	if (get(sendAddress) !== address) sendAddress.set(address);
}

function sortAddresses(addresses: IAddress[]): IAddress[] {
	return addresses.sort((a, b) => a.index - b.index);
}

export function addressesMaxIndex(addresses: IAddress[]): number {
	return addresses.reduce((max, a) => Math.max(max, a.index), -1);
}

export function addAddress(w: IWallet, index?: number | string, name?: string): void {
	let indexNum: number;
	const addresses = w.addresses || [];
	sortAddresses(addresses);
	if (!index) {
		indexNum = addressesMaxIndex(addresses) + 1;
		doAddAddress(w, addresses, indexNum, name);
	} else {
		indexNum = parseInt(index.toString());
		if (indexNum < 0 || isNaN(indexNum)) {
			console.error('Invalid index');
			return;
		}
		const existing = addresses.find(a => a.index === indexNum);
		if (existing) {
			console.error('Address with index', indexNum, 'already exists');
			return;
		}
		doAddAddress(w, addresses, indexNum, name);
	}
	sortAddresses(addresses);
	w.addresses = addresses;
	w.selected_address_index = indexNum;
	wallets.update(ws =>
		ws.map(item =>
			item.address === w.address
				? {
						...item,
						addresses: [...addresses],
						selected_address_index: indexNum,
					}
				: item
		)
	);
}

export function addressIndexAlreadyExists(wallet: IWallet, index: number): boolean {
	if (wallet?.addresses) return wallet.addresses.some(address => address.index === index);
	else return false;
}

function doAddAddress(w: IWallet, addresses: IAddress[], index: number, name?: string): void {
	if (!w.phrase) {
		console.error('Cannot derive address: wallet.phrase is undefined');
		return;
	}
	let mn = Mnemonic.fromPhrase(w.phrase);
	let path = getIndexedAccountPath(index);
	let derived_wallet = HDNodeWallet.fromMnemonic(mn, path);
	let a: IAddress = {
		address: derived_wallet.address,
		name: name || 'Address ' + index,
		path: path,
		index: index,
	};
	addresses.push(a);
}

export function selectAddress(wallet: IWallet, address: IAddress): void {
	wallet.selected_address_index = address.index;
	wallets.update(v => v);
	selectedWalletID.set(wallet.address);
}

export function generateMnemonic(): Mnemonic {
	return Mnemonic.fromEntropy(randomBytes(32));
}

export async function addWallet(mnemonic: Mnemonic, name?: string): Promise<void> {
	let newWallet = HDNodeWallet.fromMnemonic(mnemonic);
	let wallet: IWallet = {
		phrase: mnemonic.phrase,
		address: newWallet.address,
		selected_address_index: 0,
		name: '',
		addresses: [],
	};
	wallets.update(w => {
		wallet.name = name ? name : 'My wallet ' + (w.length + 1);
		w.push(wallet);
		return w;
	});
	selectedWalletID.set(get(wallets)[get(wallets).length - 1].address);
	addAddress(wallet);
}

export function editWallet(wallet: IWallet, name: string): boolean {
	let success = false;
	wallets.update(w => {
		const index = w.findIndex(item => item === wallet);
		if (index !== -1) {
			w[index] = { ...w[index], name };
			success = true;
		}
		return w;
	});
	return success;
}

export async function getBalance(): Promise<void> {
	const p = get(provider);
	console.log('getBalance selectedNetwork: ', get(selectedNetwork), 'provider: ', p);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	if (net && p && addr) {
		try {
			console.log('Getting balance for', addr.address);
			const balanceBigNumber = await p.getBalance(addr.address);
			console.log('balanceBigNumber', balanceBigNumber);
			balanceTimestamp.set(new Date());
			const balanceFormated = formatEther(balanceBigNumber);
			balance.set({
				crypto: {
					amount: balanceFormated,
					currency: net.currency.symbol,
				},
				fiat: {
					amount: '?',
					currency: 'USD',
				},
			});
			const rates = await exchangeRates();
			console.log('got1 rates:', rates);
			const rates2 = rates['rates'];
			console.log('got2 rates:', rates2);
			if (rates2) {
				balance.update(b => {
					const amount_str = b?.crypto?.amount;
					const currency = b?.crypto?.currency;
					const rate = rates2[currency];
					if (amount_str && currency) {
						if (rate) b.fiat.amount = (parseFloat(amount_str) * rate).toString();
						else b.fiat.amount = 'no rate for ' + currency;
					}
					return b;
				});
			} else console.error('No rates');
		} catch (error) {
			console.error('Error while getting balance:', error);
			balance.set({
				crypto: {
					amount: '?',
					currency: net.currency.symbol,
				},
				fiat: {
					amount: '?',
					currency: '?',
				},
			});
			balanceTimestamp.set(new Date());
		}
	} else {
		balance.set({
			crypto: {
				amount: '?',
				currency: 'N/A',
			},
			fiat: {
				amount: '?',
				currency: 'N/A',
			},
		});
		balanceTimestamp.set(null);
	}
}

async function exchangeRates(): Promise<void> {
	const url = 'https://api.coinbase.com/v2/exchange-rates?currency=USD';
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error('HTTP error, status: ' + response.status);
		const data = await response.json();
		return data['data'];
	} catch (error) {
		console.error('Error fetching exchange rates:', error);
	}
}

export async function getTokenBalances(): Promise<void> {
	const p = get(provider);
	console.log('getTokenBalances selectedNetwork: ', get(selectedNetwork), 'provider: ', p);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	const tokenList = get(tokens);
	if (!net || !p || !addr || !tokenList.length) {
		tokenBalances.set([]);
		return;
	}
	const balances: ITokenBalance[] = [];
	for (const token of tokenList) {
		try {
			const abi = ['function balanceOf(address owner) view returns (uint256)'];
			const contract = new Contract(token.contract_address, abi, p);
			const balance = await contract.balanceOf(addr.address);
			const decimals = 18; // TODO: load from contract for tokens with different decimals
			const formattedBalance = formatUnits(balance, decimals);
			balances.push({
				symbol: token.symbol,
				contract_address: token.contract_address,
				balance: {
					amount: formattedBalance,
					currency: token.symbol,
				},
				fiat: {
					amount: '?',
					currency: 'USD',
				},
			});
		} catch (error) {
			console.error(`Error getting balance for token ${token.symbol}:`, error);
			balances.push({
				symbol: token.symbol,
				contract_address: token.contract_address,
				balance: {
					amount: '?',
					currency: token.symbol,
				},
				fiat: {
					amount: '?',
					currency: '?',
				},
			});
		}
	}

	tokenBalances.set(balances);
	try {
		const rates = await exchangeRates();
		const rates2 = rates['rates'];
		if (rates2) {
			tokenBalances.update(balances => {
				return balances.map(tokenBalance => {
					const rate = rates2[tokenBalance.symbol];
					if (rate && tokenBalance.balance.amount !== '?') tokenBalance.fiat.amount = (parseFloat(tokenBalance.balance.amount) * rate).toString();
					else tokenBalance.fiat.amount = 'no rate for ' + tokenBalance.symbol;
					return tokenBalance;
				});
			});
		}
	} catch (error) {
		console.error('Error fetching exchange rates for tokens:', error);
	}
}

export async function getTokenBalance(tokenSymbol: string): Promise<void> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	const tokenList = get(tokens);
	if (!net || !p || !addr) return;
	const token = tokenList.find(t => t.symbol === tokenSymbol);
	if (!token) return;
	console.log('Getting token balance for', token.symbol);
	try {
		const abi = ['function balanceOf(address owner) view returns (uint256)'];
		const contract = new Contract(token.contract_address, abi, p);
		const balance = await contract.balanceOf(addr.address);
		const decimals = 18; // TODO: load from contract for tokens with different decimals
		const formattedBalance = formatUnits(balance, decimals);
		const newTokenBalance: ITokenBalance = {
			symbol: token.symbol,
			contract_address: token.contract_address,
			balance: {
				amount: formattedBalance,
				currency: token.symbol,
			},
			fiat: {
				amount: '?',
				currency: '?',
			},
		};
		tokenBalances.update(balances => {
			const index = balances.findIndex(b => b.symbol === tokenSymbol);
			if (index >= 0) balances[index] = newTokenBalance;
			else balances.push(newTokenBalance);
			return balances;
		});
		try {
			const rates = await exchangeRates();
			const rates2 = rates['rates'];
			if (rates2) {
				tokenBalances.update(balances => {
					return balances.map(tokenBalance => {
						if (tokenBalance.symbol === tokenSymbol) {
							const rate = rates2[tokenBalance.symbol];
							if (rate && tokenBalance.balance.amount !== '?') tokenBalance.fiat.amount = (parseFloat(tokenBalance.balance.amount) * rate).toString();
							else tokenBalance.fiat.amount = 'no rate for ' + tokenBalance.symbol;
						}
						return tokenBalance;
					});
				});
			}
		} catch (error) {
			console.error('Error fetching exchange rate for token:', error);
		}
	} catch (error) {
		console.error('Error getting balance for token ' + token.symbol + ':', error);
		const errorTokenBalance: ITokenBalance = {
			symbol: token.symbol,
			contract_address: token.contract_address,
			balance: {
				amount: '?',
				currency: token.symbol,
			},
			fiat: {
				amount: '?',
				currency: '?',
			},
		};
		tokenBalances.update(balances => {
			const index = balances.findIndex(b => b.symbol === tokenSymbol);
			if (index >= 0) balances[index] = errorTokenBalance;
			else balances.push(errorTokenBalance);
			return balances;
		});
	}
}

export async function sendTransaction(address: string, etherValue: bigint, etherValueFee: string, currency: string): Promise<void> {
	const selectedWalletValue = get(selectedWallet);
	const selectedAddressValue = get(selectedAddress);
	if (!selectedWalletValue || !selectedAddressValue) {
		console.error('No selected wallet or address');
		return;
	}
	const mn = Mnemonic.fromPhrase(selectedWalletValue.phrase);
	let hd_wallet = HDNodeWallet.fromMnemonic(mn, selectedAddressValue.path).connect(get(provider));
	let data = 'you can put data here';
	const request: PreparedTransactionRequest = {
		to: address,
		from: selectedAddressValue.address,
		value: etherValue,
		//new Uint8Array(data.split('').map(c => c.charCodeAt(0))),
		data: data,
	};
	//maxFeePerGas: etherValueFee,
	//nonce: await provider.getTransactionCount(selectedAddressValue.address),
	console.log('selectedAddressValue.address:', selectedAddressValue);
	console.log('provider:', get(provider));
	console.log('mn:', mn);
	console.log('hd_wallet:', hd_wallet);
	console.log('tx request:', request);
	console.log('hd_wallet.estimateGas:');
	let eg = await hd_wallet.estimateGas(request);
	console.log('estimateGas:', eg);
	console.log('hd_wallet.sendTransaction:');
	let tx = await hd_wallet.sendTransaction(request);
	console.log('wait..', tx);
	await tx.wait();
	console.log('Transaction sent OK');
	/*
	let log = {
		dir: 'sent',
		date: new Date(),
		from: request.from,
		to: request.to,
		currency: currency,
		hash: tx.hash,
		chainID: tx.chainId.toString(),
		nonce: tx.nonce,
		tx_type: tx.type,
		estimatedGas: formatEther(eg),
		gasLimit: formatEther(tx.gasLimit),
		gasPrice: formatEther(tx.gasPrice),
		value: formatEther(tx.value),
	};
	console.log('log:', log);
	console.log('log:', JSON.stringify(log));
	if (!selectedWalletValue.log) selectedWalletValue.log = [];
	selectedWalletValue.log.push(log);
	wallets.update(w => w);
*/
	/*
} catch (error) {
 console.error('Error while sending a transaction:', error);
}
*/
}

export function addNetwork(net: INetwork): boolean {
	if (get(networks)?.find(n => n.name === net.name)) return false;
	const my_net: INetwork = {
		guid: getGuid(),
		name: net.name,
		chainID: net.chainID,
		currency: {
			symbol: net.currency.symbol,
			iconURL: net.currency.iconURL,
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
	networks.update(n => {
		return n.filter(item => item !== net);
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

export function deleteAddressFromWallet(wallet: IWallet, index: string | number): void {
	wallets.update(ws => ws.map(item => (item.address === wallet.address ? { ...item, addresses: (item.addresses ?? []).filter(a => a.index !== index) } : item)));
}

export function editAddressName(wallet: IWallet, index: string | number, name: string): void {
	wallets.update(ws =>
		ws.map(w =>
			w.address === wallet.address
				? {
						...w,
						addresses: (w.addresses || []).map(a => (a.index === index ? { ...a, name } : a)),
					}
				: w
		)
	);
}

export function reorderWallets(reorderedWallets: IWallet[]): void {
	wallets.set(reorderedWallets);
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

export function initializeDefaultNetworks(): void {
	console.log('initializeDefaultNetworks() called');
	if (get(default_networks).length > 0) {
		console.log('Default networks already loaded');
		return;
	}

	loadDefaultNetworks()
		.then(networks => {
			console.log('loadDefaultNetworks() resolved with:', networks.length, 'networks');
			default_networks.set(
				networks.map(network => ({
					...network,
					guid: getGuid(),
					tokens: network.tokens || [],
				}))
			);
			console.log('default_networks store updated');
			initializeNetworksIfNeeded();
		})
		.catch(error => {
			console.error('loadDefaultNetworks() failed:', error);
		});
}

async function initializeNetworksIfNeeded(): Promise<void> {
	const currentNetworks = get(networks);
	const defaultNets = get(default_networks);
	if (currentNetworks.length === 0 && defaultNets.length > 0) {
		networks.set([...defaultNets]);
		const selectedNetId = get(selectedNetworkID);
		if (!selectedNetId && defaultNets.length > 0 && defaultNets[0].guid) selectedNetworkID.set(defaultNets[0].guid);
	} else if (currentNetworks.length > 0) {
		const selectedNetId = get(selectedNetworkID);
		if (!selectedNetId && currentNetworks[0].guid) selectedNetworkID.set(currentNetworks[0].guid);
	}
	const currentWallets = get(wallets);
	const selectedWalletId = get(selectedWalletID);
	if (currentWallets.length > 0 && !selectedWalletId) selectedWalletID.set(currentWallets[0].address);
}

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

export function checkIfNetworksExist(): boolean {
	return get(networks).length > 0;
}

export function selectRPCURL(url: string): void {
	const net = get(selectedNetwork);
	if (!net) return;
	if (net.rpcURLs && net.rpcURLs.includes(url)) rpcURL.set(url);
}
