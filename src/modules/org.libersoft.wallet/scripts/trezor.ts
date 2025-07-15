import { writable } from 'svelte/store';
import type { TransactionRequest } from 'ethers';
interface TrezorDevice {
	id: string;
	path: string;
	label: string;
	state: string;
	features: {
		vendor: string;
		model: string;
		major_version: number;
		minor_version: number;
		patch_version: number;
	};
}
interface TrezorAccount {
	address: string;
	path: string;
	publicKey: string;
	balance?: string;
	name?: string;
}
interface TrezorResponse<T> {
	success: boolean;
	payload: T;
	error?: string;
}
export interface TrezorWallet {
	type: 'trezor';
	name: string;
	address: string;
	path: string;
	publicKey: string;
	deviceId: string;
}
export const trezorConnected = writable<boolean>(false);
export const trezorDevice = writable<TrezorDevice | null>(null);
export const trezorAccounts = writable<TrezorAccount[]>([]);
export const trezorWallets = writable<TrezorWallet[]>([]);
export const trezorLoading = writable<boolean>(false);
export const trezorError = writable<string | null>(null);
let TrezorConnect: any = null;

export async function initializeTrezor(): Promise<boolean> {
	try {
		// Import Trezor Connect dynamically
		const { default: connect } = await import('@trezor/connect');
		TrezorConnect = connect;

		// Initialize Trezor Connect
		await TrezorConnect.init({
			lazyLoad: true,
			manifest: {
				email: 'dev@libersoft.org',
				appUrl: 'https://libersoft.org',
			},
		});

		// Listen for device events
		TrezorConnect.on('DEVICE_EVENT', (event: any) => {
			console.log('Trezor device event:', event);
			if (event.type === 'device-connect') {
				trezorDevice.set(event.device);
				trezorConnected.set(true);
				trezorError.set(null);
			} else if (event.type === 'device-disconnect') {
				trezorDevice.set(null);
				trezorConnected.set(false);
				trezorAccounts.set([]);
				trezorWallets.set([]);
				trezorError.set('Device disconnected');
			}
		});
		return true;
	} catch (error) {
		console.error('Failed to initialize Trezor:', error);
		trezorError.set(error instanceof Error ? error.message : 'Failed to initialize Trezor');
		return false;
	}
}

/**
 * Connect to Trezor device
 */
export async function connectTrezor(): Promise<boolean> {
	if (!TrezorConnect) {
		console.error('Trezor Connect not initialized');
		return false;
	}
	try {
		trezorLoading.set(true);
		const result = await TrezorConnect.getDeviceState();
		if (result.success) {
			trezorConnected.set(true);
			return true;
		} else {
			console.error('Failed to connect to Trezor:', result.error);
			return false;
		}
	} catch (error) {
		console.error('Error connecting to Trezor:', error);
		return false;
	} finally {
		trezorLoading.set(false);
	}
}

/**
 * Get Ethereum accounts from Trezor
 */
export async function getTrezorEthereumAccounts(startIndex: number = 0, count: number = 5): Promise<TrezorAccount[]> {
	if (!TrezorConnect) {
		console.error('Trezor Connect not initialized');
		return [];
	}
	try {
		trezorLoading.set(true);
		trezorError.set(null);
		const accounts: TrezorAccount[] = [];
		for (let i = startIndex; i < startIndex + count; i++) {
			const path = `m/44'/60'/0'/0/${i}`;
			const result = await TrezorConnect.ethereumGetAddress({
				path: path,
				showOnTrezor: false,
			});
			if (result.success) {
				accounts.push({
					address: result.payload.address,
					path: path,
					publicKey: result.payload.publicKey,
					name: `Trezor Account ${i + 1}`,
				});
			}
		}
		trezorAccounts.set(accounts);
		return accounts;
	} catch (error) {
		console.error('Error getting Trezor Ethereum accounts:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get Ethereum accounts';
		trezorError.set(errorMessage);
		return [];
	} finally {
		trezorLoading.set(false);
	}
}

/**
 * Create Trezor wallet from account
 */
export async function createTrezorWallet(account: TrezorAccount, name?: string): Promise<TrezorWallet | null> {
	let currentDevice: TrezorDevice | null = null;
	const unsubscribe = trezorDevice.subscribe(d => (currentDevice = d));
	unsubscribe();
	if (!currentDevice) {
		trezorError.set('No Trezor device connected');
		return null;
	}
	const wallet: TrezorWallet = {
		type: 'trezor',
		name: name || account.name || `Trezor Wallet`,
		address: account.address,
		path: account.path,
		publicKey: account.publicKey,
		deviceId: (currentDevice as TrezorDevice).id,
	};
	// Add to trezor wallets store
	trezorWallets.update(wallets => [...wallets, wallet]);
	return wallet;
}

/**
 * Get all Trezor wallets
 */
export function getTrezorWallets(): TrezorWallet[] {
	let wallets: TrezorWallet[] = [];
	const unsubscribe = trezorWallets.subscribe(w => (wallets = w));
	unsubscribe();
	return wallets;
}

/**
 * Sign Ethereum transaction with Trezor (compatible with Ethers.js)
 */
export async function signEthereumTransaction(wallet: TrezorWallet, transaction: TransactionRequest): Promise<TrezorResponse<{ r: string; s: string; v: number }>> {
	if (!TrezorConnect) {
		return { success: false, payload: null as any, error: 'Trezor Connect not initialized' };
	}
	try {
		trezorLoading.set(true);
		trezorError.set(null);
		// Convert Ethers.js transaction to Trezor format
		const trezorTransaction = {
			nonce: transaction.nonce ? `0x${transaction.nonce.toString(16)}` : '0x0',
			gasPrice: transaction.gasPrice ? `0x${transaction.gasPrice.toString(16)}` : '0x0',
			gasLimit: transaction.gasLimit ? `0x${transaction.gasLimit.toString(16)}` : '0x0',
			to: transaction.to || '',
			value: transaction.value ? `0x${transaction.value.toString(16)}` : '0x0',
			data: transaction.data || '',
			chainId: transaction.chainId || 1,
		};
		const result = await TrezorConnect.ethereumSignTransaction({
			path: wallet.path,
			transaction: trezorTransaction,
		});
		if (result.success) {
			return {
				success: true,
				payload: {
					r: result.payload.r,
					s: result.payload.s,
					v: result.payload.v,
				},
			};
		} else {
			return {
				success: false,
				payload: null as any,
				error: result.error || 'Failed to sign transaction',
			};
		}
	} catch (error) {
		console.error('Error signing Ethereum transaction:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to sign transaction';
		trezorError.set(errorMessage);
		return { success: false, payload: null as any, error: errorMessage };
	} finally {
		trezorLoading.set(false);
	}
}

/**
 * Sign Ethereum message with Trezor
 */
export async function signEthereumMessage(wallet: TrezorWallet, message: string): Promise<TrezorResponse<{ address: string; signature: string }>> {
	if (!TrezorConnect) return { success: false, payload: null as any, error: 'Trezor Connect not initialized' };
	try {
		trezorLoading.set(true);
		trezorError.set(null);
		const result = await TrezorConnect.ethereumSignMessage({
			path: wallet.path,
			message: message,
		});
		if (result.success) {
			return {
				success: true,
				payload: {
					address: result.payload.address,
					signature: result.payload.signature,
				},
			};
		} else {
			return {
				success: false,
				payload: null as any,
				error: result.error || 'Failed to sign message',
			};
		}
	} catch (error) {
		console.error('Error signing Ethereum message:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to sign message';
		trezorError.set(errorMessage);
		return { success: false, payload: null as any, error: errorMessage };
	} finally {
		trezorLoading.set(false);
	}
}

/**
 * Get public key from Trezor for Ethereum
 */
export async function getTrezorEthereumPublicKey(path: string): Promise<TrezorResponse<{ publicKey: string; address: string }>> {
	if (!TrezorConnect) return { success: false, payload: null as any, error: 'Trezor Connect not initialized' };
	try {
		trezorLoading.set(true);
		trezorError.set(null);
		const result = await TrezorConnect.ethereumGetPublicKey({
			path: path,
			showOnTrezor: false,
		});
		if (result.success) {
			return {
				success: true,
				payload: {
					publicKey: result.payload.publicKey,
					address: result.payload.address,
				},
			};
		} else {
			return {
				success: false,
				payload: null as any,
				error: result.error || 'Failed to get public key',
			};
		}
	} catch (error) {
		console.error('Error getting public key:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get public key';
		trezorError.set(errorMessage);
		return { success: false, payload: null as any, error: errorMessage };
	} finally {
		trezorLoading.set(false);
	}
}

/**
 * Disconnect from Trezor
 */
export async function disconnectTrezor(): Promise<void> {
	if (TrezorConnect) {
		await TrezorConnect.dispose();
	}

	trezorConnected.set(false);
	trezorDevice.set(null);
	trezorAccounts.set([]);
	trezorWallets.set([]);
	trezorError.set(null);
}

/**
 * Verify that a wallet belongs to the connected Trezor device
 */
export async function verifyTrezorWallet(wallet: TrezorWallet): Promise<boolean> {
	let currentDevice: TrezorDevice | null = null;
	const unsubscribe = trezorDevice.subscribe(d => (currentDevice = d));
	unsubscribe();
	if (!currentDevice || (currentDevice as TrezorDevice).id !== wallet.deviceId) return false;
	// Verify by getting the address from the device
	const result = await getTrezorEthereumPublicKey(wallet.path);
	if (result.success) return result.payload.address.toLowerCase() === wallet.address.toLowerCase();
	return false;
}

/**
 * Remove a Trezor wallet from the store
 */
export function removeTrezorWallet(address: string): void {
	trezorWallets.update(wallets => wallets.filter(wallet => wallet.address.toLowerCase() !== address.toLowerCase()));
}

/**
 * Get device info
 */
export async function getTrezorDeviceInfo(): Promise<TrezorResponse<any>> {
	if (!TrezorConnect) return { success: false, payload: null, error: 'Trezor Connect not initialized' };
	try {
		trezorLoading.set(true);
		trezorError.set(null);
		const result = await TrezorConnect.getFeatures();
		if (result.success) return result;
		else {
			return {
				success: false,
				payload: null,
				error: result.error || 'Failed to get device info',
			};
		}
	} catch (error) {
		console.error('Error getting device info:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get device info';
		trezorError.set(errorMessage);
		return { success: false, payload: null, error: errorMessage };
	} finally {
		trezorLoading.set(false);
	}
}

/**
 * Apply settings to device
 */
export async function applyTrezorSettings(params: { label?: string; usePassphrase?: boolean; homescreen?: string }): Promise<TrezorResponse<any>> {
	if (!TrezorConnect) return { success: false, payload: null, error: 'Trezor Connect not initialized' };
	try {
		trezorLoading.set(true);
		trezorError.set(null);
		const result = await TrezorConnect.applySettings({
			label: params.label,
			use_passphrase: params.usePassphrase,
			homescreen: params.homescreen,
		});
		if (result.success) return result;
		else {
			return {
				success: false,
				payload: null,
				error: result.error || 'Failed to apply settings',
			};
		}
	} catch (error) {
		console.error('Error applying settings:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to apply settings';
		trezorError.set(errorMessage);
		return { success: false, payload: null, error: errorMessage };
	} finally {
		trezorLoading.set(false);
	}
}
