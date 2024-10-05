import { derived, get, writable } from 'svelte/store';
import {
 HDNodeWallet,
 JsonRpcProvider,
 formatEther,
 parseEther,
 randomBytes,
 Mnemonic,
 getIndexedAccountPath
} from 'ethers';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.js';
import { networks } from './networks.js';

export const status = writable('Started.');
export const rpcURL = writable(null);

let provider;
let reconnectionTimer;

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

export const selectedAddress = derived([selectedWallet], ([$selectedWallet]) => {
 console.log($selectedWallet);
 let addresses = $selectedWallet?.addresses || [];
 let result = addresses.find(a => a.index === $selectedWallet.selected_address_index);
 console.log('SELECTEDADDRESS', result);
 return result;
});

selectedAddress.subscribe(value => {
 console.log('selectedAddress', value);
 //getBalance();
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

let refreshTimer = setInterval(refresh, 10000);

function resetBalance() {
 balance.set({
  crypto: {amount: '?', currency: get(selectedNetwork)?.currency.symbol || '?'},
  fiat: {amount: '?', currency: 'USD'}
 });
 balanceTimestamp.set(null);
}

async function refresh() {
 if (provider) {
  await getBalance();
 }
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

function reconnect() {
 provider = null;

 console.log('Reconnecting to', get(selectedNetwork));

 let net = get(selectedNetwork);
 if (!net) return;

 console.log('RECONNECT');
 status.set('Connecting to ' + net.name);

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


function sortAddresses(addresses) {
 return addresses.sort((a, b) => {
  if (a.index < b.index) return -1;
  if (a.index > b.index) return 1;
  return 0;
 });
}

function addressesMaxIndex(addresses) {
 return addresses.reduce((max, a) => Math.max(max, a.index), -1);
}

export function addAddress(w, index) {
 let indexNum = parseInt(index);

 console.log('addAddress to wallet ', w);
 let addresses = w.addresses || [];
 sortAddresses(addresses);
 if (index === undefined) {
  indexNum = addressesMaxIndex(addresses) + 1;
  doAddAddress(w, addresses, indexNum);
 } else if (indexNum < 0) {
  window.alert('Invalid index');
  return;
 }
 else
 {
  let existing = addresses.find(a => a.index === indexNum);
  if (existing) {
   console.log('Address with index', indexNum, 'already exists');
   existing.deleted = false;
  } else {
   console.log('Adding address with index', indexNum);
   doAddAddress(w, addresses, indexNum);
  }
 }
 sortAddresses(addresses);
 w.addresses = addresses;
 w.selected_address_index = indexNum;
 wallets.update(w => w);
}

function doAddAddress(w, addresses, index) {
 let mn = Mnemonic.fromPhrase(get(selectedWallet).phrase);
 let path = getIndexedAccountPath(index);
 let derived_wallet = HDNodeWallet.fromMnemonic(mn, path);
 let a = {address: derived_wallet.address, name: 'Address ' + index, path: path, index: index};
 addresses.push(a);
}

export function selectAddress(wallet, address) {
 wallet.selected_address_index = address.index;
 wallets.update(v => v);
 selectedWalletID.set(wallet.address);
}

export function walletAddresses(wallet) {
 return (wallet.addresses || []).filter(a => !a.deleted);
}

export function generateMnemonic() {
 return Mnemonic.fromEntropy(randomBytes(32));
}

function connectToURL() {
 console.log('Connecting to', get(rpcURL));
 provider = new JsonRpcProvider(get(rpcURL), get(selectedNetwork).chainID);

 provider.on('error', error => {
  console.log('Provider error:', error);
  provider.destroy();
  provider = null;
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
 status.set('Trying next url: ' + url);
}

export async function addWallet(mnemonic, suffix = '') {
 let newWallet = HDNodeWallet.fromMnemonic(mnemonic);
 let wallet = {
  phrase: mnemonic.phrase,
  address: newWallet.address,
  selected_address_index: 0,
 };
 wallets.update(w => {
  wallet.name = 'My Yellow Wallet ' + (w.length + 1) + suffix;
  w.push(wallet);
  return w;
 });
 selectedWalletID.set(get(wallets)[get(wallets).length - 1].address);
 addAddress(wallet);
}

export async function getBalance() {
 console.log('getBalance selectedNetwork: ', get(selectedNetwork), 'provider: ', provider);
 if (get(selectedNetwork) && provider && get(selectedAddress)) {
  try {
   console.log('Getting balance for', get(selectedAddress).address);
   const balanceBigNumber = await provider.getBalance(get(selectedAddress).address);
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

  /*
  provider.getLogs({ address: get(selectedWallet).address }).then(logs => {
   console.log('Logs:', logs);
  });
  */
 }
}

async function sendTransaction(recipient, amount) {
 let hd_wallet = HDNodeWallet.fromMnemonic(get(selectedWallet).phrase, get(selectedAddress).path);
 try {
  const tx = await hd_wallet.sendTransaction({
   to: recipient,
   value: parseEther(amount),
  });
  await tx.wait();
  //await getBalance();
  console.log('Transaction sent OK');
 } catch (error) {
  console.error('Error while sending a transaction:', error);
 }
}
