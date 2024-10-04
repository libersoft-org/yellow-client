import { derived, get, writable } from 'svelte/store';
import { HDNodeWallet, Wallet, JsonRpcProvider, formatEther, parseEther, randomBytes, Mnemonic, getIndexedAccountPath } from 'ethers';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.js';
import { networks } from './networks.js';

export const status = writable('Started.');
export const rpcURL = writable(null);
export const wallets = localStorageSharedStore('wallets', []);

export const selectedNetworkID = localStorageSharedStore('selectedNetworkID', null);
export const selectedNetwork = derived([selectedNetworkID, networks], ([$selectedNetworkID, $networks]) => {
 const r = $networks.find(n => n.name === $selectedNetworkID);
 console.log('selectedNetwork', r);
 return r;
});
export const selectedWalletID = localStorageSharedStore('selectedWalletID', null);
export const selectedWallet = derived([wallets, selectedWalletID], ([$wallets, $selectedWalletID]) => {
 const r = $wallets.find(w => w.address === $selectedWalletID);
 console.log('selectedWallet', r);
 return r;
});

export let hd_index = writable(0);

export const balance = writable({
 crypto: {
  amount: '?',
  currency: 'N/A',
 },
 fiat: {
  amount: '?',
  currency: 'USD',
 },
});
export const balanceTimestamp = writable(null);

let wallet;
let provider;
let reconnectionTimer;

function resetBalance() {
 balance.set({ crypto: { amount: '?', currency: get(selectedNetwork)?.currency.symbol || '?' }, fiat: { amount: '?', currency: 'USD' } });
 balanceTimestamp.set(null);
}

selectedNetwork.subscribe(value => {
 console.log('selectedNetwork', value);
 resetBalance();
 reconnect();
});
selectedWallet.subscribe(value => {
 console.log('selectedWallet', value);
 resetBalance();
 reconnect();
});

let balanceTimer = setInterval(getBalance, 10000);

function reconnect() {
 let net = get(selectedNetwork);
 if (!net) return;
 let wal = get(selectedWallet);
 if (!wal) return;
 if (!wal.selected_address_index) return;
 console.log('RECONNECT');

 clearTimeout(reconnectionTimer);
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

export function addAddress() {
 console.log('addAddress');
 let w = get(selectedWallet);
 let addresses = w.addresses || [];
 let index = addresses.length;
 w.selected_address_index = index;
 let mn = Mnemonic.fromPhrase(get(selectedWallet).phrase);
 let path = getIndexedAccountPath(index);
 let derived_wallet = HDNodeWallet.fromMnemonic(mn, path);
 let a = { address: derived_wallet.address, name: 'Address ' + index, path: path, index: index };
 addresses.push(a);
 w.addresses = addresses;
 wallets.update(w => w);
}

export function selectAddress(address) {
 selectedWallet.selected_address_index = address.index;
 wallets.update(w => w);
}

export function generateMnemonic() {
 return Mnemonic.fromEntropy(randomBytes(32));
}

function connectToURL() {
 let sw = get(selectedWallet);
 provider = new JsonRpcProvider(get(rpcURL), get(selectedNetwork).chainID);
 let mn = Mnemonic.fromPhrase(sw.phrase);
 wallet = HDNodeWallet.fromMnemonic(mn, getIndexedAccountPath(sw.selected_address_index)).connect(provider);

 provider.on('error', error => {
  console.log('Provider error:', error);
  provider.destroy();
  provider = null;
  wallet = null;
  setNextUrl();
  reconnectionTimer = setTimeout(reconnect, 10000);
 });
 provider.on('network', newNetwork => {
  console.log('Network changed:', newNetwork.toJSON());
 });
}

function setNextUrl() {
 let net = get(selectedNetwork);
 let i = net.rpcURLs.indexOf(get(rpcURL));
 i += 1;
 let url;
 if (i >= net.rpcURLs.length) {
  url = net.rpcURLs[0];
 } else {
  url = net.rpcURLs[i];
 }
 rpcURL.set(url);
}

export async function addWallet(mnemonic, suffix = '') {
 let newWallet = Wallet.fromPhrase(mnemonic.phrase);
 wallets.update(w => {
  w.push({
   name: 'My Yellow Wallet ' + (w.length + 1) + suffix,
   phrase: mnemonic.phrase,
   address: newWallet.address,
   selected_address_index: 0,
  });
  return w;
 });
 selectedWalletID.set(get(wallets)[get(wallets).length - 1].address);
}

export async function getBalance() {
 if (get(selectedNetwork) && get(selectedWallet) && provider && wallet) {
  try {
   const balanceBigNumber = await provider.getBalance(get(selectedWallet).address);
   balanceTimestamp.set(new Date());
   const balanceFormated = formatEther(balanceBigNumber);
   balance.set({
    crypto: {
     amount: balanceFormated,
     currency: get(selectedNetwork).currency.symbol,
    },
    fiat: {
     amount: '?',
     currency: 'USD',
    },
   });
  } catch (error) {
   console.log('Error while getting balance:', error);
  }
 }
}

async function sendTransaction(recipient, amount) {
 if (wallet) {
  try {
   const tx = await wallet.sendTransaction({
    to: recipient,
    value: parseEther(amount),
   });
   await tx.wait();
   await getBalance();
   console.log('Transaction sent OK');
  } catch (error) {
   console.error('Error while sending a transaction:', error);
  }
 } else console.error('Wallet not found');
}
