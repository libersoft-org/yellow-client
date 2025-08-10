// Example usage of ledger.ts with existing wallet system
// Import polyfills first
import './ledger-polyfills';
import { initializeLedger, connectLedger, getLedgerEthereumAccounts, createLedgerWallet, signEthereumTransaction, signEthereumMessage, ledgerConnected, ledgerWallets, ledgerDevice, ledgerError, type LedgerWallet } from './ledger';

/**
 * Initialize Ledger integration when the app starts
 */
export async function initWalletLedger() {
	const initialized = await initializeLedger();
	if (!initialized) {
		console.warn('Failed to initialize Ledger');
		return false;
	}
	// Try to connect to device
	const connected = await connectLedger();
	if (connected) console.log('Ledger device connected successfully');
	return true;
}

/**
 * Create a new Ledger wallet and add it to the wallet system
 */
export async function addLedgerWalletToSystem(accountIndex: number = 0, name?: string) {
	// Get accounts from Ledger
	const accounts = await getLedgerEthereumAccounts(accountIndex, 1);
	if (accounts.length === 0) throw new Error('No accounts found on Ledger device');
	const account = accounts[0];
	// Create Ledger wallet
	const ledgerWallet = await createLedgerWallet(account, name);
	if (!ledgerWallet) throw new Error('Failed to create Ledger wallet');
	// Here you would integrate with your existing wallet system
	// For example, add to selectedAddress store or wallets array
	return ledgerWallet;
}

/**
 * Sign transaction using Ledger wallet
 * This function bridges between your existing wallet system and Ledger
 */
export async function signTransactionWithLedger(ledgerWallet: LedgerWallet, transaction: any) {
	// Your transaction object from Ethers.js
	// Sign the transaction with Ledger
	const result = await signEthereumTransaction(ledgerWallet.path, transaction);
	if (!result.success) throw new Error(result.error || 'Failed to sign transaction');
	// Return the signature components that can be used with Ethers.js
	return {
		r: result.payload.r,
		s: result.payload.s,
		v: result.payload.v,
	};
}

/**
 * Sign message using Ledger wallet
 */
export async function signMessageWithLedger(ledgerWallet: LedgerWallet, message: string) {
	// Sign the message with Ledger
	const result = await signEthereumMessage(ledgerWallet.path, ledgerWallet.address, message);
	if (!result.success) throw new Error(result.error || 'Failed to sign message');
	return result.payload;
}

/**
 * Check if a wallet is a Ledger wallet
 */
export function isLedgerWallet(wallet: any): wallet is LedgerWallet {
	return wallet && wallet.type === 'ledger';
}

/**
 * Get all Ledger wallets from the store
 */
export function getAllLedgerWallets(): LedgerWallet[] {
	let wallets: LedgerWallet[] = [];
	const unsubscribe = ledgerWallets.subscribe(w => (wallets = w));
	unsubscribe();
	return wallets;
}

/**
 * Check if Ledger is connected
 */
export function isLedgerConnected(): boolean {
	let connected = false;
	const unsubscribe = ledgerConnected.subscribe(c => (connected = c));
	unsubscribe();
	return connected;
}

/**
 * Get Ledger connection status and device info
 */
export function getLedgerStatus() {
	let connected = false;
	let device: any = null;
	let error: string | null = null;
	const unsubscribeConnected = ledgerConnected.subscribe(c => (connected = c));
	const unsubscribeDevice = ledgerDevice.subscribe(d => (device = d));
	const unsubscribeError = ledgerError.subscribe(e => (error = e));
	// Clean up subscriptions
	unsubscribeConnected();
	unsubscribeDevice();
	unsubscribeError();
	return {
		connected,
		device,
		error,
	};
}

/**
 * Wait for Ledger device to be connected
 */
export function waitForLedgerConnection(timeout: number = 30000): Promise<boolean> {
	return new Promise((resolve, reject) => {
		let isConnected = false;
		const unsubscribe = ledgerConnected.subscribe(connected => {
			if (connected && !isConnected) {
				isConnected = true;
				unsubscribe();
				resolve(true);
			}
		});
		// Set timeout
		const timeoutId = setTimeout(() => {
			if (!isConnected) {
				unsubscribe();
				reject(new Error('Timeout waiting for Ledger connection'));
			}
		}, timeout);
		// Clean up timeout if resolved
		const originalResolve = resolve;
		resolve = value => {
			clearTimeout(timeoutId);
			originalResolve(value);
		};
	});
}

/**
 * Retry connection to Ledger device
 */
export async function retryLedgerConnection(maxRetries: number = 3): Promise<boolean> {
	for (let i = 0; i < maxRetries; i++) {
		try {
			const connected = await connectLedger();
			if (connected) return true;
		} catch (error) {
			console.error(`Ledger connection attempt ${i + 1} failed:`, error);
			// Wait before retry
			if (i < maxRetries - 1) await new Promise(resolve => setTimeout(resolve, 1000));
		}
	}
	return false;
}
