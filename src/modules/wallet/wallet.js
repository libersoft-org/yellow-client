import { derived, get, writable } from 'svelte/store';
import { Wallet, JsonRpcProvider, formatEther, parseEther, randomBytes, Mnemonic } from 'ethers';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.js';
import { registerModule } from '../../core/core.js';
import WalletSidebar from './pages/wallet-sidebar.svelte';
import WalletContent from './pages/wallet-content.svelte';
import { networks } from './networks.js';

export const status = writable('Started.');
export const wallets = localStorageSharedStore('wallets', []);
export const selectedNetwork = writable(null);
export const selectedWalletID = localStorageSharedStore('selectedWalletID', null);
export const selectedWallet = derived([wallets, selectedWalletID], ([$wallets, $selectedWalletID]) => {
 return $wallets.find(w => w.address === $selectedWalletID);
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

let wallet;
let provider;
let reconnectionTimer;
let rpcURL;

registerModule('wallet', {
 callbacks: {},
 panels: {
  sidebar: WalletSidebar,
  content: WalletContent,
 },
});

selectedNetwork.subscribe(value => {
 reconnect();
});

export function setNetwork(network) {
 selectedNetwork.set(network);
}

function reconnect() {
 let net = get(selectedNetwork);
 if (!net) return;
 clearTimeout(reconnectionTimer);
 if (!rpcURL) {
  rpcURL = net.rpcURLs[0];
  if (!rpcURL) {
   status.set('No RPC URL found for the selected network');
   return;
  }
 } else {
  const nextRPCURLIndex = net.rpcURLs.indexOf(rpcURL) + 1;
  if (nextRPCURLIndex >= net.rpcURLs.length) {
   rpcURL = null;
   reconnectionTimer = setTimeout(reconnect, 15000);
   status.set('Waiting to reconnect...');
   return;
  } else {
   rpcURL = net.rpcURLs[nextRPCURLIndex];
   connectToURL(rpcURL);
  }
 }
}

function connectToURL(url) {
 provider = new JsonRpcProvider(url, get(selectedNetwork).chainID);
 wallet = wallet.connect(provider);
 provider.on('error', error => {
  console.log('Provider error:', error);
  provider.destroy();
  reconnectionTimer = setTimeout(reconnect, 1000);
 });
 provider.on('network', (newNetwork, oldNetwork) => {
  console.log('Network changed:', newNetwork, oldNetwork);
 });
}

export function generateMnemonic() {
 return Mnemonic.fromEntropy(randomBytes(32));
}

export async function saveWallet(mnemonic) {
 wallet = Wallet.fromPhrase(mnemonic.phrase);
 wallets.update(w => {
  w.push({
    name: 'My Yellow Wallet ' + (w.length + 1),
    address: wallet.address,
    privateKey: wallet.privateKey,
  });
  return w;
 });
}

export async function getBalance() {
 if (get(selectedNetwork) && get(selectedWallet) && provider) {
  try {
   const balanceBigNumber = await provider.getBalance(get(selectedWallet).address);
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
   console.error('Error while getting balance:', error);
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
