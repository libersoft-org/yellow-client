// Import polyfills FIRST before any Ledger libraries
import './ledger-polyfills';

import { writable, derived, get } from 'svelte/store';
import type { TransactionRequest } from 'ethers';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import EthApp from '@ledgerhq/hw-app-eth';
interface LedgerDevice {
	id: string;
	name: string;
	productId: number;
	productName?: string;
	vendorId: number;
	opened: boolean;
	// Additional fields for device identification similar to Trezor
	deviceModel?: {
		internal_model: string;
		model: string;
	};
}
export interface LedgerAccount {
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
export const ledgerConfig = writable<any>(null);
export const ledgerAccounts = writable<LedgerAccount[]>([]);
export const ledgerWallets = writable<LedgerWallet[]>([]);
export const ledgerLoading = writable<boolean>(false);
export const ledgerError = writable<string | null>(null);

// Derived store for device identifiers, similar to Trezor's staticSessionId
export const ledgerDeviceId = derived([ledgerDevice], ([$ledgerDevice]) => {
	return $ledgerDevice?.id;
});

// Helper function to check if a wallet matches the current device
export const isLedgerWalletActive = (wallet?: any): boolean => {
	const $ledgerDeviceId = get(ledgerDeviceId);
	return !!$ledgerDeviceId && $ledgerDeviceId === wallet?.identifiers?.deviceId;
};
let currentTransport: any = null;

/**
 * Check if WebHID is supported and requirements are met
 */
export function checkWebHIDSupport(): { supported: boolean; error?: string } {
	// Check if we're in browser environment
	if (typeof window === 'undefined') {
		return { supported: false, error: 'Not running in browser environment' };
	}

	// Check WebHID support
	if (!('hid' in navigator)) {
		return { supported: false, error: 'WebHID is not supported in this browser. Please use Chrome/Edge 89+ or another compatible browser.' };
	}

	// Check HTTPS requirement (except for localhost)
	if (location.protocol !== 'https:' && !location.hostname.includes('localhost') && location.hostname !== '127.0.0.1') {
		return { supported: false, error: 'WebHID requires HTTPS connection.' };
	}

	return { supported: true };
}

/**
 * Initialize Ledger integration - this just sets up the stores, no device interaction yet
 */
export async function initializeLedger(): Promise<boolean> {
	try {
		// Check WebHID support first
		const supportCheck = checkWebHIDSupport();
		if (!supportCheck.supported) {
			ledgerError.set(supportCheck.error || 'WebHID not supported');
			return false;
		}

		// Just initialize the stores - actual device connection happens on user interaction
		ledgerConnected.set(false);
		ledgerDevice.set(null);
		ledgerAccounts.set([]);
		ledgerWallets.set([]);
		ledgerError.set(null);
		console.log('Ledger stores initialized - ready for user interaction');
		return true;
	} catch (error) {
		console.error('Failed to initialize Ledger stores:', error);
		ledgerError.set(error instanceof Error ? error.message : 'Failed to initialize Ledger');
		return false;
	}
}

/**
 * Connect to Ledger device - must be called from user interaction
 */
export async function connectLedger(): Promise<boolean> {
	//return new Promise<boolean>(async (resolve, reject) => {

	try {
		ledgerLoading.set(true);
		ledgerError.set(null);

		// Close existing transport
		if (currentTransport) await currentTransport.close();

		// Create new transport - this must be called from user interaction
		currentTransport = await TransportWebHID.create();

		// Test connection by getting app configuration
		const eth = new EthApp(currentTransport);
		const config = await eth.getAppConfiguration();
		console.log('Ledger app configuration:', config);

		// Set up device listener for disconnect detection (optional - basic functionality works without it)
		try {
			TransportWebHID.listen({
				next: (event: any) => {
					console.log('Ledger device event:', event);

					if (event.type === 'add') {
						if (event.device) {
							const deviceInfo: LedgerDevice = {
								id: 'ledger-' + Date.now(),
								name: event.descriptor.productName || 'Ledger Device',
								productId: event.descriptor.productId || 0,
								vendorId: event.descriptor.vendorId || 0,
								opened: true,
								productName: event.descriptor.productName || 'Unknown',
								deviceModel: {
									internal_model: event.deviceModel?.id || 'ledger',
									model: event.deviceModel?.productName || event.device.productName || 'Ledger Device',
								},
							};
							ledgerDevice.set(deviceInfo);
							ledgerConnected.set(true);
							//							resolve(true);
						}
					} else if (event.type === 'remove') {
						console.log('Device removed');
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
					console.warn('Ledger device listener error (non-critical):', error);
					// Don't set ledgerError here as it's not critical for basic functionality
				},
				complete: () => {
					console.log('Ledger device listener complete');
				},
			});
		} catch (listenerError) {
			console.warn('Could not set up device listener (non-critical):', listenerError);
			// Continue without listener - basic functionality still works
		}

		// Create device object with app configuration info for unique identification
		let deviceId = 'ledger-' + Date.now();
		let deviceName = 'Ledger Device';

		// Try to get additional device info from app configuration
		try {
			// Create a unique device ID based on device characteristics
			if (config.arbitraryDataEnabled !== undefined && config.version) {
				deviceId = `ledger-${config.version}-${Date.now()}`;
				deviceName = `Ledger Device (App v${config.version})`;
			}
		} catch (error) {
			console.warn('Could not get detailed device info:', error);
		}

		return true;
	} catch (error) {
		console.error('Error connecting to Ledger:', error);
		let errorMessage = 'Failed to connect to Ledger';

		if (error instanceof Error) {
			// Provide specific error messages for common issues
			if (error.name === 'NotAllowedError') {
				errorMessage = 'Connection denied. Please make sure you:\n' + '• Selected a Ledger device in the browser dialog\n' + '• Have your Ledger device unlocked\n' + '• Have the Ethereum app open on your device\n' + "• Close Ledger Live if it's running";
			} else if (error.name === 'NotFoundError') {
				errorMessage = 'No Ledger device found. Please connect your device and try again.';
			} else if (error.name === 'NotSupportedError') {
				errorMessage = 'Ledger device not supported or driver issue.';
			} else if (error.message.includes('busy') || error.message.includes('in use')) {
				errorMessage = 'Device is busy. Please close Ledger Live and try again.';
			} else if (error.message.includes('CLA_NOT_SUPPORTED') || error.message.includes('UNKNOWN_APDU') || error.message.includes('0x6d02')) {
				errorMessage = 'Please open the Ethereum app on your Ledger device.\n\n' + 'Steps:\n' + '1. Navigate to the Ethereum app on your Ledger\n' + '2. Press both buttons to open it\n' + '3. Wait for "Application is ready" message\n' + '4. Try connecting again';
			} else if (error.message.includes('SECURITY_STATUS_NOT_SATISFIED')) {
				errorMessage = 'Please unlock your Ledger device with your PIN.';
			} else if (error.message.includes('0x6985')) {
				errorMessage = 'Transaction rejected by user or device locked.';
			} else if (error.message.includes('0x6f00')) {
				errorMessage = 'App not ready. Please wait for the Ethereum app to fully load.';
			} else {
				errorMessage = error.message;
			}
		}

		ledgerError.set(errorMessage);
		return false;
	} finally {
		ledgerLoading.set(false);
	}
	//});
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
		const result = await eth.signPersonalMessage(wallet.path, Array.from(new TextEncoder().encode(message), byte => byte.toString(16).padStart(2, '0')).join(''));
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
 * Get device identifiers for wallet creation (similar to Trezor's staticSessionId)
 */
export function getLedgerDeviceIdentifiers(): any | null {
	let device: LedgerDevice | null = null;
	const unsubscribe = ledgerDevice.subscribe((d: LedgerDevice | null) => {
		device = d;
	});
	unsubscribe();

	if (!device) return null;

	// TypeScript now knows device is not null here
	const deviceData: LedgerDevice = device;
	return {
		deviceId: deviceData.id,
		deviceModel: deviceData.deviceModel,
	};
}

/**
 * Add hardware address to wallet (similar to Trezor's doAddHardwareAddressTrezor)
 * This is called from doAddAddress when adding addresses to existing Ledger wallets
 */
export async function doAddHardwareAddressLedger(w: any, addresses: any[], index: number, name?: string): Promise<void> {
	console.log('Adding Ledger address at index:', index);
	const path = `m/44'/60'/0'/0/${index}`;
	const result = await getLedgerEthereumAccounts(index, 1);
	console.log('Ledger address result:', result);
	if (result.length !== 1) {
		console.error('Failed to get Ledger address for index:', index);
		return;
	}
	const res = result[0];
	const address = {
		name: name || `Ledger Address ${index + 1}`,
		address: res.address,
		path: path,
		index: index,
		publicKey: res.publicKey,
	};
	addresses.push(address);
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
