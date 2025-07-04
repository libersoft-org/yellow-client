import { derived, get, writable } from 'svelte/store';
import { formatEther, getIndexedAccountPath, HDNodeWallet, JsonRpcProvider, Mnemonic, randomBytes, type PreparedTransactionRequest } from 'ethers';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.ts';
import { getGuid } from '@/core/core.ts';
export { default_networks } from './default_networks.js';
export interface IAddress {
	address: string;
	name: string;
	path: string;
	index: number;
}
export interface IWallet {
	phrase: string;
	address: string;
	selected_address_index: number;
	name: string;
	addresses?: IAddress[];
}
export interface IToken {
	guid: string;
	icon: string;
	symbol: string;
	name: string;
	contract_address: string;
}
export interface INetwork {
	guid?: string;
	name: string;
	chainID: number;
	explorerURL?: string;
	currency: {
		symbol: string;
		iconURL?: string;
	};
	rpcURLs?: string[];
	tokens?: IToken[];
}
export interface IBalance {
	crypto: {
		amount: string;
		currency: string;
	};
	fiat: {
		amount: string;
		currency: string;
	};
}
export interface IAddressBookItem {
	guid: string;
	name: string;
	address: string;
}

export const settingsModal = writable<any>();
export const walletsModal = writable<any>();

export const status = writable<any>({ color: 'red', text: 'Started.' });
export const rpcURL = writable<string | null>(null);
export const networks = localStorageSharedStore<INetwork[]>('networks', []);
export let section = writable<string | null>('balance');
export let sendAddress = writable<string | number | undefined>();
const WALLET_PROVIDER_RECONNECT_INTERVAL = import.meta.env.VITE_YELLOW_CLIENT_WALLET_PROVIDER_RECONNECT_INTERVAL || 10000;
let provider: JsonRpcProvider | null = null;
let reconnectionTimer;

networks.subscribe((nets: INetwork[]) => {
	let modified = false;
	for (let net of nets) {
		if (net.guid === undefined) {
			net.guid = getGuid();
			console.log('Adding guid to network', net);
			modified = true;
		}
		if (net.tokens === undefined) {
			net.tokens = [];
			console.log('Adding tokens to network', net);
			modified = true;
		}
		for (let token of net.tokens) {
			if (token.guid === undefined) {
				console.log('Adding guid to token', token);
				token.guid = getGuid();
				modified = true;
			}
		}
	}
	if (modified) {
		setTimeout(() => {
			console.log('Updating networks');
			networks.update(n => n);
		}, 1000);
	}
});

export const wallets = localStorageSharedStore<IWallet[]>('wallets', []);
export const selectedNetworkID = localStorageSharedStore<string | null>('selectedNetworkID', null);
export const selectedNetwork = derived([selectedNetworkID, networks], ([$selectedNetworkID, $networks]) => {
	const r = $networks.find(n => n.guid === $selectedNetworkID);
	return r;
});
export const selectedWalletID = localStorageSharedStore<string | null>('selectedWalletID', null);
export const selectedWallet = derived([wallets, selectedWalletID], ([$wallets, $selectedWalletID]) => {
	console.log('WWWWWWWWWWWWW', $wallets, $selectedWalletID);
	const r = $wallets.find(w => w.address === $selectedWalletID);
	return r;
});
export const selectedAddress = derived([selectedWallet], ([$selectedWallet]) => {
	let addresses = $selectedWallet?.addresses || [];
	let result = addresses.find(a => a.index === $selectedWallet?.selected_address_index);
	return result;
});
export const selectedMainCurrencySymbol = derived([selectedNetwork], ([$selectedNetwork]) => {
	return $selectedNetwork?.currency.symbol;
});
let tokens = derived([selectedNetwork], ([$selectedNetwork]) => {
	return ($selectedNetwork?.tokens || []).map(token => ({
		symbol: token.symbol,
	}));
});
export let currencies = derived([tokens, selectedMainCurrencySymbol], ([$tokens, $selectedMainCurrencySymbol]) => {
	return [$selectedMainCurrencySymbol, ...$tokens.map(token => token.symbol)].filter((currency): currency is string => currency !== undefined);
});
export const addressBook = localStorageSharedStore<IAddressBookItem[]>('addressbook', []);

addressBook.subscribe((value: IAddressBookItem[]) => {
	let modifyed = false;
	for (let i of value) {
		if (!i.guid) {
			i.guid = getGuid();
			modifyed = true;
		}
	}
	if (modifyed) addressBook.update(v => v);
});

selectedAddress.subscribe((value: IAddress | undefined) => {
	//console.log('selectedAddress', value);
	// getBalance();
});

wallets.subscribe((wals: IWallet[]) => {
	while (wallets_cleanup(wals)) {
		wallets.update(w => w);
	}
});

export function setSection(name: string) {
	if (get(section) !== name) section.set(name);
}

export function setSendAddress(address: string) {
	if (get(sendAddress) !== address) sendAddress.set(address);
}

function wallets_cleanup(wallets: any) {
	for (let i = 0; i < wallets.length; i++) {
		for (let j = 0; j < wallets.length; j++) {
			if (i !== j && wallets[i].address === wallets[j].address) {
				window.alert('Wallet with address ' + wallets[i].address + ' already exists');
				wallets.splice(i, 1);
				return true;
			}
			if (i !== j && wallets[i].phrase === wallets[j].phrase) {
				window.alert('Wallet with phrase ' + wallets[i].phrase + ' already exists');
				wallets.splice(i, 1);
				return true;
			}
		}
	}
}

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
export const balanceTimestamp = writable<Date | null>(null);
//let refreshTimer = window.setInterval(refresh, 30000);

function resetBalance(): void {
	balance.set({
		crypto: {
			amount: '?',
			currency: get(selectedNetwork)?.currency.symbol || '?',
		},
		fiat: { amount: '?', currency: 'USD' },
	});
	balanceTimestamp.set(null);
}

/*
async function refresh(): Promise<void> {
 if (provider) {
  await getBalance();
 }
}
*/

selectedNetwork.subscribe((value: INetwork | undefined) => {
	//console.log('selectedNetwork', value);
	resetBalance();
	reconnect();
});
selectedWallet.subscribe((value: IWallet | undefined) => {
	//console.log('selectedWallet', value);
	resetBalance();
	reconnect();
});

function reconnect(): void {
	provider = null;
	//console.log('Reconnecting to', get(selectedNetwork));
	let net = get(selectedNetwork);
	if (!net) return;
	//console.log('wallet RECONNECT');
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

function sortAddresses(addresses: IAddress[]): IAddress[] {
	return addresses.sort((a, b) => {
		if (a.index < b.index) return -1;
		if (a.index > b.index) return 1;
		return 0;
	});
}

export function addressesMaxIndex(addresses: IAddress[]): number {
	return addresses.reduce((max, a) => Math.max(max, a.index), -1);
}

export function addAddress(w: IWallet, index?: number | string, name?: string): void {
	let indexNum: number;
	console.log('addAddress to wallet ', w, index, name);
	let addresses = w.addresses || [];
	sortAddresses(addresses);
	if (!index) {
		indexNum = addressesMaxIndex(addresses) + 1;
		doAddAddress(w, addresses, indexNum, name);
	} else {
		indexNum = parseInt(index.toString());
		if (indexNum < 0 || isNaN(indexNum)) {
			console.error('Invalid index');
			return;
		} else {
			let existing = addresses.find(a => a.index === indexNum);
			if (existing) {
				console.error('Address with index', indexNum, 'already exists');
			} else {
				console.log('Adding address with index', indexNum);
				doAddAddress(w, addresses, indexNum, name);
			}
		}
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
	console.log('doAddAddress Mnemonic.fromPhrase');
	if (!w.phrase) {
		console.error('Cannot derive address: wallet.phrase is undefined');
		return;
	}
	let mn = Mnemonic.fromPhrase(w.phrase);
	console.log('doAddAddress getIndexedAccountPath');
	let path = getIndexedAccountPath(index);
	console.log('doAddAddress HDNodeWallet.fromMnemonic');
	let derived_wallet = HDNodeWallet.fromMnemonic(mn, path);
	let a: IAddress = {
		address: derived_wallet.address,
		name: name ? name : 'Address ' + index,
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

function connectToURL(): void {
	console.log('Connecting to', get(rpcURL));
	const net = get(selectedNetwork);
	if (!net) {
		console.error('No selected network');
		return;
	}
	provider = new JsonRpcProvider(get(rpcURL)!, net.chainID);
	provider.on('error', (error: Error) => {
		console.log('Provider error:', error);
		if (provider) provider.destroy();
		provider = null;
		setNextUrl();
		reconnectionTimer = setTimeout(reconnect, WALLET_PROVIDER_RECONNECT_INTERVAL);
	});
	provider.on('network', (newNetwork: any) => {
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
	//console.log('getBalance selectedNetwork: ', get(selectedNetwork), 'provider: ', provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	if (net && provider && addr) {
		try {
			//console.log('Getting balance for', addr.address);
			const balanceBigNumber = await provider.getBalance(addr.address);
			//console.log('balanceBigNumber', balanceBigNumber);
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
			//console.log('got1 rates:', rates);
			const rates2 = rates['rates'];
			//console.log('got2 rates:', rates2);
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
			} else {
				console.log('no rates');
			}
		} catch (error) {
			console.log('Error while getting balance:', error);
		}
		/*
  provider.getLogs({ address: get(selectedWallet).address }).then(logs => {
    console.log('Logs:', logs);
  });
  */
	}
}

async function exchangeRates(): Promise<void> {
	const url = 'https://api.coinbase.com/v2/exchange-rates?currency=USD';
	//console.log('fetch exchangeRates...', url);
	const response = await fetch(url);
	const data = await response.json();
	//console.log('data:', data);
	return data['data'];
}

export async function sendTransaction(address: string, etherValue, etherValueFee, currency): Promise<void> {
	const selectedWalletValue = get(selectedWallet);
	const selectedAddressValue = get(selectedAddress);
	if (!selectedWalletValue || !selectedAddressValue) {
		console.error('No selected wallet or address');
		return;
	}
	const mn = Mnemonic.fromPhrase(selectedWalletValue.phrase);
	let hd_wallet = HDNodeWallet.fromMnemonic(mn, selectedAddressValue.path).connect(provider);
	//try {

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
	console.log('provider:', provider);
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

export function addNetwork(net): boolean {
	if (get(networks)?.find(n => n.name === net.name)) return false;
	let my_net = {
		guid: getGuid(),
		name: net.name,
		chainID: net.chainID,
		currency: {
			symbol: net.currency.symbol,
			iconURL: net.currency.iconURL,
		},
		explorerURL: net.explorerURL,
		rpcURLs: net.rpcURLs.map(url => url),
	};
	networks.update(n => {
		n.push(my_net);
		return n;
	});
	return true;
}

export function deleteNetwork(net): void {
	networks.update(n => {
		return n.filter(n => n !== net);
	});
}
