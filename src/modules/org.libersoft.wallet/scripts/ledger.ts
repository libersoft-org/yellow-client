import { writable } from 'svelte/store';
import type { TransactionRequest } from 'ethers';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import EthApp from '@ledgerhq/hw-app-eth';
interface LedgerDevice {
	id: string;
	name: string;
	path: string;
	productId: number;
	vendorId: number;
	opened: boolean;
}
interface LedgerAccount {
	address: string;
	path: string;
	publicKey: string;
	balance?: string;
	name?: string;
}
interface LedgerResponse<T> {
	success: boolean;
	payload: T;
	error?: string;
}
export interface LedgerWallet {
	type: 'ledger';
	name: string;
	address: string;
	path: string;
	publicKey: string;
	deviceId: string;
}
export const ledgerConnected = writable<boolean>(false);
export const ledgerDevice = writable<LedgerDevice | null>(null);
export const ledgerAccounts = writable<LedgerAccount[]>([]);
export const ledgerWallets = writable<LedgerWallet[]>([]);
export const ledgerLoading = writable<boolean>(false);
export const ledgerError = writable<string | null>(null);
let currentTransport: any = null;

/**
 * Initialize Ledger integration
 */
export async function initializeLedger(): Promise<boolean> {
	try {
		// Listen for device connection/disconnection
		TransportWebUSB.listen({
			next: (event: any) => {
				console.log('Ledger device event:', event);
				if (event.type === 'add') {
					const device: LedgerDevice = {
						id: event.device.productId + '_' + event.device.vendorId,
						name: event.device.productName || 'Ledger Device',
						path: event.device.path || '',
						productId: event.device.productId,
						vendorId: event.device.vendorId,
						opened: false,
					};
					ledgerDevice.set(device);
					ledgerConnected.set(true);
					ledgerError.set(null);
				} else if (event.type === 'remove') {
					ledgerDevice.set(null);
					ledgerConnected.set(false);
					ledgerAccounts.set([]);
					ledgerWallets.set([]);
					ledgerError.set('Device disconnected');
					// Close transport if open
					if (currentTransport) {
						currentTransport.close();
						currentTransport = null;
					}
				}
			},
			error: (error: any) => {
				console.error('Ledger device error:', error);
				ledgerError.set(error.message || 'Device error');
			},
			complete: () => {
				console.log('Ledger device listener complete');
			},
		});
		return true;
	} catch (error) {
		console.error('Failed to initialize Ledger:', error);
		ledgerError.set(error instanceof Error ? error.message : 'Failed to initialize Ledger');
		return false;
	}
}

/**
 * Connect to Ledger device
 */
export async function connectLedger(): Promise<boolean> {
	try {
		ledgerLoading.set(true);
		ledgerError.set(null);
		// Close existing transport
		if (currentTransport) await currentTransport.close();
		// Create new transport
		currentTransport = await TransportWebUSB.create();
		// Test connection by getting app configuration
		const eth = new EthApp(currentTransport);
		const config = await eth.getAppConfiguration();
		console.log('Ledger app configuration:', config);
		ledgerConnected.set(true);
		return true;
	} catch (error) {
		console.error('Error connecting to Ledger:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Ledger';
		ledgerError.set(errorMessage);
		return false;
	} finally {
		ledgerLoading.set(false);
	}
}

/**
 * Get Ethereum accounts from Ledger
 */
export async function getLedgerEthereumAccounts(startIndex: number = 0, count: number = 5): Promise<LedgerAccount[]> {
	if (!currentTransport) {
		console.error('Ledger not connected');
		return [];
	}
	try {
		ledgerLoading.set(true);
		ledgerError.set(null);
		const eth = new EthApp(currentTransport);
		const accounts: LedgerAccount[] = [];
		for (let i = startIndex; i < startIndex + count; i++) {
			const path = `44'/60'/0'/0/${i}`;
			try {
				const result = await eth.getAddress(path, false);
				accounts.push({
					address: result.address,
					path: path,
					publicKey: result.publicKey,
					name: `Ledger Account ${i + 1}`,
				});
			} catch (error) {
				console.error(`Error getting account ${i}:`, error);
				// Continue with other accounts
			}
		}
		ledgerAccounts.set(accounts);
		return accounts;
	} catch (error) {
		console.error('Error getting Ledger Ethereum accounts:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get Ethereum accounts';
		ledgerError.set(errorMessage);
		return [];
	} finally {
		ledgerLoading.set(false);
	}
}

/**
 * Create Ledger wallet from account
 */
export async function createLedgerWallet(account: LedgerAccount, name?: string): Promise<LedgerWallet | null> {
	let currentDevice: LedgerDevice | null = null;
	const unsubscribe = ledgerDevice.subscribe(d => (currentDevice = d));
	unsubscribe();
	if (!currentDevice) {
		ledgerError.set('No Ledger device connected');
		return null;
	}
	const wallet: LedgerWallet = {
		type: 'ledger',
		name: name || account.name || `Ledger Wallet`,
		address: account.address,
		path: account.path,
		publicKey: account.publicKey,
		deviceId: (currentDevice as LedgerDevice).id,
	};
	// Add to ledger wallets store
	ledgerWallets.update(wallets => [...wallets, wallet]);
	return wallet;
}
/**
 * Get all Ledger wallets
 */
export function getLedgerWallets(): LedgerWallet[] {
	let wallets: LedgerWallet[] = [];
	const unsubscribe = ledgerWallets.subscribe(w => {
		wallets = w;
	});
	unsubscribe();
	return wallets;
}
/**
 * Sign Ethereum transaction with Ledger (compatible with Ethers.js)
 */
export async function signEthereumTransaction(wallet: LedgerWallet, transaction: TransactionRequest): Promise<LedgerResponse<{ r: string; s: string; v: number }>> {
	if (!currentTransport) return { success: false, payload: null as any, error: 'Ledger not connected' };
	try {
		ledgerLoading.set(true);
		ledgerError.set(null);
		const eth = new EthApp(currentTransport);
		// Prepare transaction for Ledger
		const unsignedTx = {
			nonce: transaction.nonce ? `0x${transaction.nonce.toString(16)}` : '0x0',
			gasPrice: transaction.gasPrice ? `0x${transaction.gasPrice.toString(16)}` : '0x0',
			gasLimit: transaction.gasLimit ? `0x${transaction.gasLimit.toString(16)}` : '0x0',
			to: transaction.to || '',
			value: transaction.value ? `0x${transaction.value.toString(16)}` : '0x0',
			data: transaction.data || '0x',
		};
		// Serialize transaction for Ledger
		const serializedTx = serializeTransaction(unsignedTx);
		// Sign with Ledger
		const result = await eth.signTransaction(wallet.path, serializedTx);
		return {
			success: true,
			payload: {
				r: '0x' + result.r,
				s: '0x' + result.s,
				v: parseInt(result.v, 16),
			},
		};
	} catch (error) {
		console.error('Error signing Ethereum transaction:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to sign transaction';
		ledgerError.set(errorMessage);
		return { success: false, payload: null as any, error: errorMessage };
	} finally {
		ledgerLoading.set(false);
	}
}

/**
 * Sign Ethereum message with Ledger
 */
export async function signEthereumMessage(wallet: LedgerWallet, message: string): Promise<LedgerResponse<{ address: string; signature: string }>> {
	if (!currentTransport) return { success: false, payload: null as any, error: 'Ledger not connected' };
	try {
		ledgerLoading.set(true);
		ledgerError.set(null);
		const eth = new EthApp(currentTransport);
		// Sign message with Ledger
		const result = await eth.signPersonalMessage(wallet.path, Buffer.from(message, 'utf8').toString('hex'));
		return {
			success: true,
			payload: {
				address: wallet.address,
				signature: '0x' + result.r + result.s + result.v.toString(16).padStart(2, '0'),
			},
		};
	} catch (error) {
		console.error('Error signing Ethereum message:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to sign message';
		ledgerError.set(errorMessage);
		return { success: false, payload: null as any, error: errorMessage };
	} finally {
		ledgerLoading.set(false);
	}
}

/**
 * Get public key from Ledger for Ethereum
 */
export async function getLedgerEthereumPublicKey(path: string): Promise<LedgerResponse<{ publicKey: string; address: string }>> {
	if (!currentTransport) return { success: false, payload: null as any, error: 'Ledger not connected' };
	try {
		ledgerLoading.set(true);
		ledgerError.set(null);
		const eth = new EthApp(currentTransport);
		const result = await eth.getAddress(path, false);
		return {
			success: true,
			payload: {
				publicKey: result.publicKey,
				address: result.address,
			},
		};
	} catch (error) {
		console.error('Error getting public key:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get public key';
		ledgerError.set(errorMessage);
		return { success: false, payload: null as any, error: errorMessage };
	} finally {
		ledgerLoading.set(false);
	}
}

/**
 * Disconnect from Ledger
 */
export async function disconnectLedger(): Promise<void> {
	if (currentTransport) {
		await currentTransport.close();
		currentTransport = null;
	}
	ledgerConnected.set(false);
	ledgerDevice.set(null);
	ledgerAccounts.set([]);
	ledgerWallets.set([]);
	ledgerError.set(null);
}

/**
 * Verify that a wallet belongs to the connected Ledger device
 */
export async function verifyLedgerWallet(wallet: LedgerWallet): Promise<boolean> {
	let currentDevice: LedgerDevice | null = null;
	const unsubscribe = ledgerDevice.subscribe(d => (currentDevice = d));
	unsubscribe();
	if (!currentDevice || (currentDevice as LedgerDevice).id !== wallet.deviceId) return false;
	// Verify by getting the address from the device
	const result = await getLedgerEthereumPublicKey(wallet.path);
	if (result.success) return result.payload.address.toLowerCase() === wallet.address.toLowerCase();
	return false;
}

/**
 * Remove a Ledger wallet from the store
 */
export function removeLedgerWallet(address: string): void {
	ledgerWallets.update(wallets => wallets.filter(wallet => wallet.address.toLowerCase() !== address.toLowerCase()));
}

/**
 * Get device info
 */
export async function getLedgerDeviceInfo(): Promise<LedgerResponse<any>> {
	if (!currentTransport) return { success: false, payload: null, error: 'Ledger not connected' };
	try {
		ledgerLoading.set(true);
		ledgerError.set(null);
		const eth = new EthApp(currentTransport);
		const config = await eth.getAppConfiguration();
		return {
			success: true,
			payload: config,
		};
	} catch (error) {
		console.error('Error getting device info:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get device info';
		ledgerError.set(errorMessage);
		return { success: false, payload: null, error: errorMessage };
	} finally {
		ledgerLoading.set(false);
	}
}

/**
 * Helper function to serialize transaction for Ledger
 */
function serializeTransaction(tx: any): string {
	// This is a simplified version - in production you'd use a proper RLP encoding library
	// For now, we'll use a basic implementation
	const fields = [tx.nonce || '0x0', tx.gasPrice || '0x0', tx.gasLimit || '0x0', tx.to || '0x', tx.value || '0x0', tx.data || '0x'];
	// Convert to RLP format (simplified)
	// In production, use: @ethereumjs/rlp or similar library
	let serialized = '';
	for (const field of fields) {
		const cleanField = field.startsWith('0x') ? field.slice(2) : field;
		const length = cleanField.length / 2;
		serialized += length.toString(16).padStart(2, '0') + cleanField;
	}
	return serialized;
}

/**
 * Check if device supports EIP-1559 transactions
 */
export async function supportsEIP1559(): Promise<boolean> {
	if (!currentTransport) return false;
	try {
		const eth = new EthApp(currentTransport);
		const config = await eth.getAppConfiguration();
		// Check if app version supports EIP-1559
		// This is version-specific logic that depends on Ledger Ethereum app version
		const version = config.version;
		const [major, minor, patch] = version.split('.').map(Number);
		// EIP-1559 support was added in version 1.9.0
		if (major > 1 || (major === 1 && minor > 9) || (major === 1 && minor === 9 && patch >= 0)) return true;
		return false;
	} catch (error) {
		console.error('Error checking EIP-1559 support:', error);
		return false;
	}
}
