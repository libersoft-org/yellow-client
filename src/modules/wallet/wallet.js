import { get, writable } from 'svelte/store';
import { Wallet, JsonRpcProvider, formatEther, parseEther, randomBytes, Mnemonic } from 'ethers';
import { registerModule } from '../../core/core.js';
import { networks } from './networks.js';
import WalletSidebar from './pages/wallet-sidebar.svelte';
import WalletContent from './pages/wallet-content.svelte';

registerModule('wallet', {
 callbacks: {},
 panels: {
  sidebar: WalletSidebar,
  content: WalletContent,
 },
});

let wallet;
let selectedNetwork = get(networks)[0];
let provider = new JsonRpcProvider(selectedNetwork.rpcURLs[0], selectedNetwork.chainID);
export const address = writable(null);
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
export const wallets = writable([
 {
  id: 1,
  name: 'My Yellow Wallet 1',
 },
 {
  id: 2,
  name: 'My Yellow Wallet 2',
 },
]);

export function createWallet() {
 const mnemonic = Mnemonic.fromEntropy(randomBytes(32));
 wallet = Wallet.fromPhrase(mnemonic.phrase).connect(provider);
 address.set(wallet.address);
 getBalance();
 return mnemonic.phrase;
}

async function saveWallet(password = null) {
 if (wallet && password) {
  try {
   const encryptedJson = await wallet.encrypt(password);
   localStorage.setItem('encryptedWallet', encryptedJson);
   console.log('Wallet saved');
  } catch (error) {
   console.error('Error while wallet encryption:', error);
  }
 } else alert('Wallet or password is missing');
}

async function loadWallet(password = null) {
 const encryptedJson = localStorage.getItem('encryptedWallet');
 if (encryptedJson && password) {
  try {
   wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
   wallet = wallet.connect(provider);
   address.set(wallet.address);
   getBalance();
  } catch (error) {
   console.error('Error while wallet decription:', error);
  }
 } else console.error('No wallet found or password is missing');
}

async function getBalance() {
 if (wallet) {
  try {
   const balanceBigNumber = await provider.getBalance(get(address));
   const balanceFormated = formatEther(balanceBigNumber);
   balance.update(currentBalance => {
    return {
     ...currentBalance,
     crypto: {
      ...currentBalance.crypto,
      amount: balanceFormated,
     },
    };
   });
  } catch (error) {
   console.error('Error while getting balance:', error);
   balance.update(currentBalance => {
    return {
     ...currentBalance,
     crypto: {
      ...currentBalance.crypto,
      amount: 'N/A',
     },
    };
   });
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
   getBalance();
   console.log('Transaction sent OK');
  } catch (error) {
   console.error('Error while sending a transaction:', error);
  }
 } else console.error('Wallet not found');
}

export default {
 createWallet,
 saveWallet,
 loadWallet,
 sendTransaction,
 address,
 balance,
 wallets,
};
