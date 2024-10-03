import { derived, get, writable } from 'svelte/store';
import { Wallet, JsonRpcProvider, formatEther, parseEther, randomBytes, Mnemonic } from 'ethers';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.js';
import { registerModule } from '../../core/core.js';
import WalletSidebar from './pages/wallet-sidebar.svelte';
import WalletContent from './pages/wallet-content.svelte';
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

registerModule('wallet', {
 callbacks: {},
 panels: {
  sidebar: WalletSidebar,
  content: WalletContent,
 },
});

function resetBalance() {
 balance.set({crypto: {amount: '?', currency: get(selectedNetwork).currency.symbol}, fiat: {amount: '?', currency: 'USD'}});
}

selectedNetwork.subscribe(value => {
 resetBalance();
 reconnect();
});
selectedWallet.subscribe(value => {
 resetBalance();
 reconnect();
});

let balanceTimer = setInterval(getBalance, 10000);

function reconnect() {
 console.log('RECONNECT');
 let net = get(selectedNetwork);
 if (!net) return;
 if (!get(selectedWallet)) return;
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

function connectToURL() {
 provider = new JsonRpcProvider(get(rpcURL), get(selectedNetwork).chainID);
 wallet = Wallet.fromPhrase(get(selectedWallet).phrase, provider);
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
  getBalance();
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

export function generateMnemonic() {
 return Mnemonic.fromEntropy(randomBytes(32));
}

export async function saveWallet(mnemonic, suffix='') {
 let newWallet = Wallet.fromPhrase(mnemonic.phrase);
 wallets.update(w => {
  w.push({
   name: 'My Yellow Wallet ' + (w.length + 1) + suffix,
   phrase: mnemonic.phrase,
   address: newWallet.address,
  });
  return w;
 });
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
