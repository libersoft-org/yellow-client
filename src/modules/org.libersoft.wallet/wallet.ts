import { derived, get, writable } from 'svelte/store';
import { formatEther, getIndexedAccountPath, HDNodeWallet, JsonRpcProvider, Mnemonic, randomBytes, type PreparedTransactionRequest } from 'ethers';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.ts';
import { getGuid } from '../../core/core.js';
export { default_networks } from './default_networks.js';

interface Address {
 address: string;
 name: string;
 path: string;
 index: number;
 deleted?: boolean;
}

interface Wallet {
 phrase: string;
 address: string;
 selected_address_index: number;
 name: string;
 addresses?: Address[];
 log: any[];
}

interface Token {
 guid: string;
 icon: string;
 symbol: string;
 name: string;
 contract_address: string;
}

interface Network {
 guid: string;
 name: string;
 chainID: number;
 currency: {
  symbol: string;
 };
 rpcURLs: string[];
 tokens?: Token[];
}

interface Balance {
 crypto: {
  amount: string;
  currency: string;
 };
 fiat: {
  amount: string;
  currency: string;
 };
}

interface AddressBookItem {
 guid: string;
 alias: string;
 address: string;
}

const WALLET_PROVIDER_RECONNECT_INTERVAL = import.meta.env.WALLET_PROVIDER_RECONNECT_INTERVAL || 10000;

export const status = writable<any>({ color: 'red', text: 'Started.' });
export const rpcURL = writable<string | null>(null);

let provider: JsonRpcProvider | null = null;
let reconnectionTimer;

export const networks = localStorageSharedStore<Network[]>('networks', []);

networks.subscribe((nets: Network[]) => {
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

/*
function toHexStr(uint8) {
 return Array.from(uint8)
  .map(i => i.toString(16).padStart(2, '0'))
  .join('');
}
*/

export const wallets = localStorageSharedStore<Wallet[]>('wallets', []);
export const selectedNetworkID = localStorageSharedStore<string | null>('selectedNetworkID', null);
export const selectedNetwork = derived([selectedNetworkID, networks], ([$selectedNetworkID, $networks]) => {
 const r = $networks.find(n => n.guid === $selectedNetworkID);
 //console.log('selectedNetwork', r);
 return r;
});
export const selectedWalletID = localStorageSharedStore<string | null>('selectedWalletID', null);
export const selectedWallet = derived([wallets, selectedWalletID], ([$wallets, $selectedWalletID]) => {
 const r = $wallets.find(w => w.address === $selectedWalletID);
 //console.log('selectedWallet', r);
 return r;
});

export const selectedAddress = derived([selectedWallet], ([$selectedWallet]) => {
 //console.log('selectedWallet:', $selectedWallet);
 let addresses = $selectedWallet?.addresses || [];
 let result = addresses.find(a => a.index === $selectedWallet?.selected_address_index);
 //console.log('SELECTEDADDRESS', result);
 return result;
});

export const selectedMainCurrencySymbol = derived([selectedNetwork], ([$selectedNetwork]) => {
 return $selectedNetwork?.currency.symbol;
});

let tokens = derived([selectedNetwork], ([$selectedNetwork]) => {
 return ($selectedNetwork?.tokens || []).map(token => ({ symbol: token.symbol }));
});

export let currencies = derived([tokens, selectedMainCurrencySymbol], ([$tokens, $selectedMainCurrencySymbol]) => {
 return [$selectedMainCurrencySymbol, ...$tokens.map(token => token.symbol)];
});

export const addressBook = localStorageSharedStore<AddressBookItem[]>('addressbook', []);

addressBook.subscribe((value: AddressBookItem[]) => {
 let modifyed = false;
 for (let i of value) {
  if (!i.guid) {
   i.guid = getGuid();
   modifyed = true;
  }
 }
 if (modifyed) {
  addressBook.update(v => v);
 }
});

selectedAddress.subscribe((value: Address | undefined) => {
 //console.log('selectedAddress', value);
 // getBalance();
});

wallets.subscribe((wals: Wallet[]) => {
 while (wallets_cleanup(wals)) {
  wallets.update(w => w);
 }
});

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

export const balance = writable<Balance>({
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

let refreshTimer = window.setInterval(refresh, 30000);

function resetBalance(): void {
 balance.set({
  crypto: { amount: '?', currency: get(selectedNetwork)?.currency.symbol || '?' },
  fiat: { amount: '?', currency: 'USD' },
 });
 balanceTimestamp.set(null);
}

async function refresh(): Promise<void> {
 if (provider) {
  await getBalance();
 }
}

selectedNetwork.subscribe((value: Network | undefined) => {
 //console.log('selectedNetwork', value);
 resetBalance();
 reconnect();
});
selectedWallet.subscribe((value: Wallet | undefined) => {
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

 if (reconnectionTimer !== undefined) {
  clearTimeout(reconnectionTimer);
 }
 const rrr = get(rpcURL);
 if (!rrr || net.rpcURLs.find(url => url === rrr) === undefined) {
  if (!net.rpcURLs[0]) {
   status.set({ color: 'red', text: 'No RPC URL found for the selected network' });
   return;
  }
  rpcURL.set(net.rpcURLs[0]);
 }
 connectToURL();
}

function sortAddresses(addresses: Address[]): Address[] {
 return addresses.sort((a, b) => {
  if (a.index < b.index) return -1;
  if (a.index > b.index) return 1;
  return 0;
 });
}

function addressesMaxIndex(addresses: Address[]): number {
 return addresses.reduce((max, a) => Math.max(max, a.index), -1);
}

export function addAddress(w: Wallet, index?: number | string): void {
 let indexNum: number;

 console.log('addAddress to wallet ', w);
 let addresses = w.addresses || [];
 sortAddresses(addresses);
 console.log('sorted.');
 if (index === undefined) {
  indexNum = addressesMaxIndex(addresses) + 1;
  doAddAddress(w, addresses, indexNum);
 } else {
  indexNum = parseInt(index.toString());
  if (indexNum < 0 || isNaN(indexNum)) {
   window.alert('Invalid index');
   return;
  } else {
   let existing = addresses.find(a => a.index === indexNum);
   if (existing) {
    console.log('Address with index', indexNum, 'already exists');
    existing.deleted = false;
   } else {
    console.log('Adding address with index', indexNum);
    doAddAddress(w, addresses, indexNum);
   }
  }
 }
 console.log('sort..');
 sortAddresses(addresses);
 console.log('sorted.');
 w.addresses = addresses;
 w.selected_address_index = indexNum;
 wallets.update(ws => ws);
}

function doAddAddress(w: Wallet, addresses: Address[], index: number): void {
 console.log('doAddAddress Mnemonic.fromPhrase');
 let mn = Mnemonic.fromPhrase(w.phrase);
 console.log('doAddAddress getIndexedAccountPath');
 let path = getIndexedAccountPath(index);
 console.log('doAddAddress HDNodeWallet.fromMnemonic');
 let derived_wallet = HDNodeWallet.fromMnemonic(mn, path);
 let a: Address = {
  address: derived_wallet.address,
  name: 'Address ' + index,
  path: path,
  index: index,
 };
 addresses.push(a);
}

export function selectAddress(wallet: Wallet, address: Address): void {
 wallet.selected_address_index = address.index;
 wallets.update(v => v);
 selectedWalletID.set(wallet.address);
}

export function walletAddresses(wallet: Wallet): Address[] {
 return (wallet.addresses || []).filter(a => !a.deleted);
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
  if (provider) {
   provider.destroy();
  }
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
 if (!net) return;
 let i = net.rpcURLs.indexOf(get(rpcURL) || '');
 i += 1;
 let url: string;
 if (i >= net.rpcURLs.length) {
  url = net.rpcURLs[0];
 } else {
  url = net.rpcURLs[i];
 }
 rpcURL.set(url);
 status.set({ color: 'orange', text: 'Trying next url: ' + url });
}

export async function addWallet(mnemonic: Mnemonic, suffix = ''): Promise<void> {
 let newWallet = HDNodeWallet.fromMnemonic(mnemonic);
 let wallet: Wallet = {
  phrase: mnemonic.phrase,
  address: newWallet.address,
  selected_address_index: 0,
  name: '',
  addresses: [],
  log: [],
 };
 wallets.update(w => {
  wallet.name = 'My Wallet ' + (w.length + 1) + suffix;
  w.push(wallet);
  return w;
 });
 selectedWalletID.set(get(wallets)[get(wallets).length - 1].address);
 addAddress(wallet);
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
      if (rate) {
       b.fiat.amount = (parseFloat(amount_str) * rate).toString();
      } else {
       b.fiat.amount = 'no rate for ' + currency;
      }
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

 if (!selectedWalletValue.log) {
  selectedWalletValue.log = [];
 }
 selectedWalletValue.log.push(log);
 wallets.update(w => w);

 /*} catch (error) {
  console.error('Error while sending a transaction:', error);
 }*/
}

export function addNetwork(net): void {
 if (get(networks)?.find(n => n.name === net.name)) {
  window.alert('Network with this name already exists');
  return;
 }

 let my_net = {
  guid: getGuid(),
  name: net.name,
  chainID: net.chainID,
  rpcURLs: net.rpcURLs.map(url => url),
  currency: {
   symbol: net.currency.symbol,
   iconURL: net.currency.iconURL,
  },
  explorerURL: net.explorerURL,
 };

 networks.update(n => {
  n.push(my_net);
  return n;
 });
}

export function removeNetwork(net): void {
 networks.update(n => {
  return n.filter(n => n !== net);
 });
}
