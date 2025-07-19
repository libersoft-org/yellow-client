import { initializeTrezor, connectTrezor, getTrezorEthereumAccounts, createTrezorWallet, signEthereumTransaction, signEthereumMessage, trezorConnected, trezorWallets, type TrezorWallet } from './trezor';
import { addHardwareWallet } from './wallet';

/**
 * Initialize Trezor integration when the app starts
 */
export async function initWalletTrezor() {
	const initialized = await initializeTrezor();
	if (!initialized) {
		console.warn('Failed to initialize Trezor');
		return false;
	}
	// Try to connect to device
	const connected = await connectTrezor();
	if (connected) console.log('Trezor device connected successfully');
	return true;
}

/**
 * Create a new Trezor wallet and add it to the wallet system
 */
export async function addTrezorWalletToSystem(accountIndex: number = 0, name?: string) {
	// Get accounts from Trezor
	const accounts = await getTrezorEthereumAccounts(accountIndex, 1);
	if (accounts.length === 0) throw new Error('No accounts found on Trezor device');
	const account = accounts[0];

	// Add directly to hardware wallet system
	await addHardwareWallet(
		'trezor',
		account.address,
		name || account.name || 'Trezor Wallet',
		'trezor-device', // TODO: get actual device ID
		account.path
	);

	return account;
}

/**
 * Sign transaction using Trezor wallet
 * This function bridges between your existing wallet system and Trezor
 */
export async function signTransactionWithTrezor(
	trezorWallet: TrezorWallet,
	transaction: any // Your transaction object from Ethers.js
) {
	// Sign the transaction with Trezor
	const result = await signEthereumTransaction(trezorWallet, transaction);
	if (!result.success) throw new Error(result.error || 'Failed to sign transaction');
	// Return the signature components that can be used with Ethers.js
	return {
		r: result.payload.r,
		s: result.payload.s,
		v: result.payload.v,
	};
}

/**
 * Check if a wallet is a Trezor wallet
 */
export function isTrezorWallet(wallet: any): wallet is TrezorWallet {
	return wallet && wallet.type === 'trezor';
}

/**
 * Get all Trezor wallets from the store
 */
export function getAllTrezorWallets(): TrezorWallet[] {
	let wallets: TrezorWallet[] = [];
	const unsubscribe = trezorWallets.subscribe(w => {
		wallets = w;
	});
	unsubscribe();
	return wallets;
}

/**
 * Check if Trezor is connected
 */
export function isTrezorConnected(): boolean {
	let connected = false;
	const unsubscribe = trezorConnected.subscribe(c => {
		connected = c;
	});
	unsubscribe();
	return connected;
}
