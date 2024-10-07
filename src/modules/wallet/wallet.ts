import { derived, get, writable } from 'svelte/store';
import { HDNodeWallet, JsonRpcProvider, formatEther, parseEther, randomBytes, Mnemonic, getIndexedAccountPath } from 'ethers';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.js';
import { default_networks } from './networks.js';

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
}

interface Network {
 name: string;
 chainID: number;
 currency: {
  symbol: string;
 };
 rpcURLs: string[];
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
 alias: string;
 address: string;
}

export const status = writable<string>('Started.');
export const rpcURL = writable<string | null>(null);

let provider: JsonRpcProvider | null = null;
let reconnectionTimer: number | undefined;

export const networks = localStorageSharedStore<Network[]>('networks', []);
export const wallets = localStorageSharedStore<Wallet[]>('wallets', []);
export const selectedNetworkID = localStorageSharedStore<string | null>('selectedNetworkID', null);
export const selectedNetwork = derived<[string | null, Network[]], Network | undefined>([selectedNetworkID, networks], ([$selectedNetworkID, $networks]) => {
 const r = $networks.find(n => n.name === $selectedNetworkID);
 console.log('selectedNetwork', r);
 return r;
});
export const selectedWalletID = localStorageSharedStore<string | null>('selectedWalletID', null);
export const selectedWallet = derived<[Wallet[], string | null], Wallet | undefined>([wallets, selectedWalletID], ([$wallets, $selectedWalletID]) => {
 const r = $wallets.find(w => w.address === $selectedWalletID);
 console.log('selectedWallet', r);
 return r;
});

export const selectedAddress = derived<[Wallet | undefined], Address | undefined>([selectedWallet], ([$selectedWallet]) => {
 console.log($selectedWallet);
 let addresses = $selectedWallet?.addresses || [];
 let result = addresses.find(a => a.index === $selectedWallet?.selected_address_index);
 console.log('SELECTEDADDRESS', result);
 return result;
});

export const selectedMainCurrencySymbol = derived<[Network | undefined], string | undefined>([selectedNetwork], ([$selectedNetwork]) => {
 return $selectedNetwork?.currency.symbol;
});


let tokens = derived([selectedNetwork], ([$selectedNetwork]) => {
 return ['token1', 'token2', 'token3'].map(symbol => ({ symbol }));
});

export let currencies = derived([tokens, selectedMainCurrencySymbol], ([$tokens, $selectedMainCurrencySymbol]) => {
 return [$selectedMainCurrencySymbol, ...$tokens.map(token => token.symbol)];
});

export const addressBook = localStorageSharedStore<AddressBookItem[]>('addressbook', []);

selectedAddress.subscribe((value: Address | undefined) => {
 console.log('selectedAddress', value);
 // getBalance();
});

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

let refreshTimer: number = setInterval(refresh, 10000);

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
 console.log('selectedNetwork', value);
 resetBalance();
 reconnect();
});
selectedWallet.subscribe((value: Wallet | undefined) => {
 console.log('selectedWallet', value);
 resetBalance();
 reconnect();
});

function reconnect(): void {
 provider = null;

 console.log('Reconnecting to', get(selectedNetwork));

 let net = get(selectedNetwork);
 if (!net) return;

 console.log('RECONNECT');
 status.set('Connecting to ' + net.name);

 if (reconnectionTimer !== undefined) {
  clearTimeout(reconnectionTimer);
 }
 const rrr = get(rpcURL);
 if (!rrr || net.rpcURLs.find(url => url === rrr) === undefined) {
  if (!net.rpcURLs[0]) {
   status.set('No RPC URL found for the selected network');
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
  reconnectionTimer = setTimeout(reconnect, 10000);
 });
 provider.on('network', (newNetwork: any) => {
  console.log('Network changed:', newNetwork.toJSON());
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
 status.set('Trying next url: ' + url);
}

export async function addWallet(mnemonic: Mnemonic, suffix = ''): Promise<void> {
 let newWallet = HDNodeWallet.fromMnemonic(mnemonic);
 let wallet: Wallet = {
  phrase: mnemonic.phrase,
  address: newWallet.address,
  selected_address_index: 0,
  name: '',
  addresses: [],
 };
 wallets.update(w => {
  wallet.name = 'My Yellow Wallet ' + (w.length + 1) + suffix;
  w.push(wallet);
  return w;
 });
 selectedWalletID.set(get(wallets)[get(wallets).length - 1].address);
 addAddress(wallet);
}

export async function getBalance(): Promise<void> {
 console.log('getBalance selectedNetwork: ', get(selectedNetwork), 'provider: ', provider);
 const net = get(selectedNetwork);
 const addr = get(selectedAddress);
 if (net && provider && addr) {
  try {
   console.log('Getting balance for', addr.address);
   const balanceBigNumber = await provider.getBalance(addr.address);
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
    console.log('got rates:', rates2);
    balance.update(b => {
      const amount_str = b?.crypto?.amount;
      const currency = b?.crypto?.currency;
      const rate = rates2[currency];
      if (amount_str && currency)
        {
          if (rate) {
             b.fiat.amount = (parseFloat(amount_str) * rate).toString();
          }
          else {
            b.fiat.amount = 'no rate for ' + currency;
          }
        }
     return b;
    });
   }
   else {
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
  console.log('fetch exchangeRates...', url);
  const response = await fetch(url);
  const data = await response.json();
  console.log('data:', data);
  return data['data'];
}


async function sendTransaction(recipient: string, amount: string): Promise<void> {
 const selectedWalletValue = get(selectedWallet);
 const selectedAddressValue = get(selectedAddress);
 if (!selectedWalletValue || !selectedAddressValue) {
  console.error('No selected wallet or address');
  return;
 }
 let hd_wallet = HDNodeWallet.fromMnemonic(selectedWalletValue.phrase, selectedAddressValue.path);
 try {
  const tx = await hd_wallet.sendTransaction({
   to: recipient,
   value: parseEther(amount),
  });
  await tx.wait();
  // await getBalance();
  console.log('Transaction sent OK');
 } catch (error) {
  console.error('Error while sending a transaction:', error);
 }
}

export function addNetwork(net): void {
 if (get(networks).find(n => n.name === net.name)) {
  window.alert('Network with this name already exists');
  return;
 }

 let my_net = {
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
