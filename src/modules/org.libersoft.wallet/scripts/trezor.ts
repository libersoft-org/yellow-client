import { get, writable } from 'svelte/store';
import type { TransactionRequest } from 'ethers';
import TrezorConnect from '@trezor/connect-web';
import type { Features, Device, Success, Unsuccessful } from '@trezor/connect/lib/types';

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

export interface TrezorAccount {
	address: string;
	path: string;
	publicKey?: string;
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

export const trezorWindow = writable<Window | null>(null);
export const trezorDevice = writable<TrezorDevice | null>(null);
export const trezorAccounts = writable<TrezorAccount[]>([]);
export const trezorWallets = writable<TrezorWallet[]>([]);
export const trezorLoading = writable<boolean>(false);
export const trezorError = writable<string | null>(null);
export const isInitialized = writable<boolean>(false);

// Mutex for initialization to prevent race conditions
let initializationPromise: Promise<void> | null = null;

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
	return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs))]);
};

// Helper function to create device info from features
function createDeviceInfo(featuresPayload: Features, eventDevice?: Device): TrezorDevice {
	return {
		id: featuresPayload.device_id || eventDevice?.id || 'unknown',
		path: eventDevice?.path || '',
		label: featuresPayload.label || eventDevice?.label || 'Trezor Device',
		state: featuresPayload.device_id || eventDevice?.state || 'unknown',
		features: {
			vendor: featuresPayload.vendor || 'Trezor',
			model: featuresPayload.model || 'Unknown',
			major_version: featuresPayload.major_version || 0,
			minor_version: featuresPayload.minor_version || 0,
			patch_version: featuresPayload.patch_version || 0,
		},
	};
}

// Type guard for TrezorConnect response
function isSuccessResponse<T>(response: Success<T> | Unsuccessful): response is Success<T> {
	return response.success === true;
}

// Type guard for device event
function isDeviceConnectEvent(event: any): event is { type: 'device-connect'; device: Device } {
	return event.type === 'device-connect';
}

// Type guard for device disconnect event
function isDeviceDisconnectEvent(event: any): event is { type: 'device-disconnect' } {
	return event.type === 'device-disconnect';
}

// Helper function to manage loading/error state for async operations
async function withTrezorState<T>(operation: () => Promise<T>): Promise<T> {
	trezorLoading.set(true);
	trezorError.set(null);
	try {
		return await operation();
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		trezorError.set(errorMessage);
		throw error;
	} finally {
		trezorLoading.set(false);
	}
}

export async function initializeTrezor(): Promise<void> {
	console.log('Starting Trezor initialization...');

	// If already initialized, return immediately
	if (get(isInitialized)) {
		console.log('Trezor already initialized, skipping...');
		return;
	}

	// If initialization is already in progress, wait for it
	if (initializationPromise) {
		console.log('Trezor initialization already in progress, waiting...');
		return initializationPromise;
	}

	// Start new initialization
	initializationPromise = performInitialization();

	try {
		await initializationPromise;
	} finally {
		// Clear the promise when done (success or failure)
		initializationPromise = null;
	}
}

async function performInitialization(): Promise<void> {
	try {
		console.log('Initializing TrezorConnect with manifest...');

		const initConfig: Parameters<typeof TrezorConnect.init>[0] = {
			lazyLoad: true,
			manifest: {
				email: 'dev@libersoft.org',
				appName: 'Yellow Wallet',
				appUrl: window.location.origin,
			},
			debug: true,
			//popup: false,
			//connectSrc: 'https://connect.trezor.io/9/',
			//trustedHost: false,
		};

		await TrezorConnect.init(initConfig);
		console.log('TrezorConnect.init() completed successfully');
		isInitialized.set(true);

		// Listen for device events
		TrezorConnect.on('DEVICE_EVENT', onDeviceEvent);
		//TrezorConnect.on('DEVICE_CONNECT', onDeviceConnect);
		//TrezorConnect.on('DEVICE_DISCONNECT', onDeviceDisconnect);
	} catch (error) {
		console.error('Failed to initialize Trezor:', error);
		const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
		if (errorMessage.includes('already initialized')) {
			console.log('TrezorConnect already initialized, marking as success');
			isInitialized.set(true);
			trezorError.set(null);
		} else {
			trezorError.set(errorMessage);
			throw error; // Re-throw if it's not the "already initialized" case
		}
	}
}

async function onDeviceEvent(event: any): Promise<void> {
	console.log('TREZOR DEVICE EVENT:', event);
	if (isDeviceConnectEvent(event)) {
		if (event.device) {
			console.log('Setting device info from event...', event.device);
			const deviceInfo = createDeviceInfo(event.device as unknown as Features, event.device);
			trezorDevice.set(deviceInfo);
		}
		//trezorConnected.set(true);
		trezorError.set(null);

		// Read complete features after device connection
		try {
			console.log('Reading device features after connection...');
			const featuresResult = await TrezorConnect.getFeatures();
			if (isSuccessResponse(featuresResult)) {
				console.log('Device features obtained:', featuresResult.payload);
				// Update device store with complete feature information
				if (featuresResult.payload) {
					console.log('Setting device info from features payload...');
					trezorDevice.set(createDeviceInfo(featuresResult.payload, event.device));
				}
			} else {
				console.log('Failed to get device features, using event device info');
			}
		} catch (error) {
			console.warn('Error reading device features after connection:', error);
		}
	} else if (isDeviceDisconnectEvent(event)) {
		trezorDevice.set(null);
		//trezorConnected.set(false);
		trezorAccounts.set([]);
		trezorWallets.set([]);
		trezorError.set('Device disconnected');
	}
}

/*async function onDeviceConnect(event: any): Promise<void> {
	console.log('TREZOR DEVICE CONNECT:', event);
}*/

/*async function onDeviceDisconnect(event: any): Promise<void> {
	console.log('TREZOR DEVICE DISCONNECT:', event);
}*/

// Connect to Trezor device
export async function connectTrezor(): Promise<boolean> {
	if (!get(isInitialized)) {
		console.log('TrezorConnect not initialized, initializing first...');
		await initializeTrezor();
		if (!get(isInitialized)) {
			console.error('Failed to initialize TrezorConnect');
			trezorError.set('Failed to initialize TrezorConnect');
			return false;
		}
	}

	try {
		return await withTrezorState(async () => {
			// First enumerate devices to see if any are connected
			let result: Success<Features> | Unsuccessful | null = null;
			let lastError: Error | null = null;

			try {
				let retryCount = 0;
				const maxRetries = 3;
				const timeoutMs = 15000;

				while (retryCount < maxRetries) {
					try {
						console.log(`Attempt ${retryCount + 1}/${maxRetries} - calling getFeatures (${timeoutMs}ms timeout)...`);
						result = await withTimeout(TrezorConnect.getFeatures(), timeoutMs);
						console.log('getFeatures result:', result);

						// Check if device is busy and retry
						if (!result.success && result.payload && 'code' in result.payload && result.payload.code === 'Device_CallInProgress') {
							console.log('Device is busy, waiting 1 second before retry...');
							await new Promise(resolve => setTimeout(resolve, 1000));
							retryCount++;
							continue;
						}

						// Either success or different error - break out of retry loop
						break;
					} catch (callError) {
						console.warn(`Attempt ${retryCount + 1} failed:`, callError);
						const errorMsg = callError instanceof Error ? callError.message : 'Unknown error';

						if (errorMsg.includes('timed out')) {
							console.log(`Attempt ${retryCount + 1} timed out after ${timeoutMs}ms`);
						}

						if (retryCount === maxRetries - 1) {
							console.error('All retry attempts exhausted');
							throw callError; // Re-throw on last attempt
						}
						retryCount++;
						console.log(`Waiting 1 second before retry ${retryCount + 1}...`);
						await new Promise(resolve => setTimeout(resolve, 1000));
					}
				}
			} catch (enumerateError) {
				console.warn('Enumerate/getFeatures failed:', enumerateError);
				console.warn('Error details:', {
					message: enumerateError instanceof Error ? enumerateError.message : 'Unknown error',
					name: enumerateError instanceof Error ? enumerateError.name : 'Unknown',
					stack: enumerateError instanceof Error ? enumerateError.stack : 'No stack trace',
				});
				lastError = enumerateError instanceof Error ? enumerateError : new Error(String(enumerateError));

				// Check if this was a timeout or other error
				const errorMessage = enumerateError instanceof Error ? enumerateError.message : 'Unknown error';
				if (errorMessage.includes('timed out')) {
					console.log('Operation timed out');
					lastError = new Error('Connection timed out.');
				} else {
					// Try one more fallback with getDeviceState
					try {
						console.log('Trying TrezorConnect.getDeviceState as final fallback...');
						const deviceStateResult = await withTimeout(TrezorConnect.getDeviceState(), 5000);
						// We can't use this result directly as it has different payload type
						console.log('getDeviceState result:', deviceStateResult);
					} catch (stateError) {
						const stateErrorMessage = stateError instanceof Error ? stateError.message : 'Unknown error';
						if (stateErrorMessage.includes('timed out')) {
							lastError = new Error('All connection attempts timed out. Please ensure your Trezor is connected, unlocked, and WebUSB permission is granted.');
						} else {
							lastError = new Error(`All connection methods failed: ${stateErrorMessage}`);
						}
						console.error('getDeviceState failed:', stateError);
					}
				}
			}
			console.log('Final result after all attempts:', result);
			console.log('Last error encountered:', lastError);

			// If no result was obtained, provide helpful error message
			if (!result && lastError) {
				console.error('No result obtained, checking error type:', lastError);
				// Check if this is a "no device" error vs other errors
				const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown error';
				if (errorMessage.includes('No Trezor devices found') || errorMessage.includes('device not found') || errorMessage.includes('Unexpected message') || errorMessage.includes('Device disconnected') || errorMessage.includes('timed out') || errorMessage.includes('connection timeout') || errorMessage.includes('WebUSB permission') || errorMessage.includes('Bridge not running')) {
					// This is likely because no Trezor is connected or permission issue
					trezorError.set(errorMessage);
					console.log(errorMessage);
					return false;
				} else {
					// This is some other error
					console.error('Throwing last error for other issues:', lastError);
					throw lastError;
				}
			}
			if (result && result.success) {
				console.log('Successfully connected to Trezor device:', result.payload);
				//trezorConnected.set(true);

				// Set device info if available
				if (result.payload) {
					console.log('Setting device info from result payload...');
					trezorDevice.set(createDeviceInfo(result.payload));
				}
				return true;
			} else {
				console.error('Failed to connect to Trezor - result details:');
				console.error('- result:', result);
				console.error('- result type:', typeof result);
				console.error('- result.success:', result ? result.success : 'result is null/undefined');
				console.error('- result.error:', result && !result.success ? 'Connection failed' : 'result is null/undefined');
				console.error('- result.payload:', result ? result.payload : 'result is null/undefined');

				// Check if payload contains error information
				if (result && result.payload) {
					console.error('- payload details:', JSON.stringify(result.payload, null, 2));
					if (result.payload.error) console.error('- payload.error:', result.payload.error);
					if (result.payload.code) console.error('- payload.code:', result.payload.code);

					// Handle specific error codes
					if (result.payload.code === 'Device_CallInProgress') {
						throw new Error('Device is busy. Please wait and try again.');
					} else if (result.payload.code === 'Device_NotFound') {
						throw new Error('No Trezor device found. Please connect your Trezor device.');
					} else if (result.payload.code === 'Device_Disconnected') {
						throw new Error('Trezor device disconnected. Please reconnect your device.');
					}
				}

				const errorMsg = result && !result.success ? 'Failed to connect to Trezor' : 'Unknown connection error - no result returned';
				console.error('Setting error message:', errorMsg);
				throw new Error(errorMsg);
			}
		});
	} catch (error) {
		console.error('Error connecting to Trezor:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		trezorError.set(errorMessage);
		return false;
	}
}

// Get Ethereum accounts from Trezor
export async function getTrezorEthereumAccounts(startIndex: number = 0, count: number = 1): Promise<TrezorAccount[]> {
	return await withTrezorState(async () => {
		// or Use getPublicKey to batch retrieve addresses?

		const bundle: Parameters<typeof TrezorConnect.ethereumGetAddress>[0]['bundle'] = [];
		for (let i = startIndex; i < startIndex + count; i++) {
			bundle.push({
				path: `m/44'/60'/0'/0/${i}`,
				showOnTrezor: false,
			});
		}

		console.log('Requesting Trezor Ethereum addresses with bundle:', bundle);
		const result = await TrezorConnect.ethereumGetAddress({
			bundle: bundle,
		});
		console.log('Trezor Ethereum addresses result:', result);

		const accounts: TrezorAccount[] = [];
		if (result.success && Array.isArray(result.payload)) {
			result.payload.forEach((item: any, index: number) => {
				accounts.push({
					address: item.address,
					path: `m/44'/60'/0'/0/${startIndex + index}`,
					//publicKey: item.publicKey || '',
					//name: `Trezor Address ${startIndex + index + 1}`,
				});
			});
		} else if (result.success && !Array.isArray(result.payload)) {
			console.log(' Fallback - pokud bundle nefunguje, použijeme původní metodu');
			// for (let i = startIndex; i < startIndex + count; i++) {
			// 	const path = `m/44'/60'/0'/0/${i}`;
			// 	const singleResult = await TrezorConnect.ethereumGetAddress({
			// 		path: path,
			// 		showOnTrezor: false,
			// 	});
			// 	if (singleResult.success) {
			// 		accounts.push({
			// 			address: singleResult.payload.address,
			// 			path: path,
			// 			publicKey: (singleResult.payload as any).publicKey || '',
			// 			name: `Trezor Account ${i + 1}`,
			// 		});
			// 	}
			//}
		}
		trezorAccounts.set(accounts);
		return accounts;
	});
}

// Create Trezor wallet from account
/*export async function createTrezorWallet(account: TrezorAccount, name?: string): Promise<TrezorWallet | null> {
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
}*/

// Get all Trezor wallets
/*export function getTrezorWallets(): TrezorWallet[] {
	let wallets: TrezorWallet[] = [];
	const unsubscribe = trezorWallets.subscribe(w => (wallets = w));
	unsubscribe();
	return wallets;
}*/

// Sign Ethereum transaction with Trezor (compatible with Ethers.js)
// export async function signEthereumTransaction(
// 	wallet: TrezorWallet,
// 	transaction: TransactionRequest
// ): Promise<
// 	TrezorResponse<{
// 		r: string;
// 		s: string;
// 		v: number;
// 	}>
// > {
// 	return await withTrezorState(async () => {
// 		// Convert Ethers.js transaction to Trezor format
// 		const trezorTransaction = {
// 			nonce: transaction.nonce ? `0x${transaction.nonce.toString(16)}` : '0x0',
// 			gasPrice: transaction.gasPrice ? `0x${transaction.gasPrice.toString(16)}` : '0x0',
// 			gasLimit: transaction.gasLimit ? `0x${transaction.gasLimit.toString(16)}` : '0x0',
// 			to: transaction.to ? transaction.to.toString() : null,
// 			value: transaction.value ? `0x${transaction.value.toString(16)}` : '0x0',
// 			data: transaction.data || '',
// 			chainId: Number(transaction.chainId) || 1,
// 		};
// 		const result = await TrezorConnect.ethereumSignTransaction({
// 			path: wallet.path,
// 			transaction: trezorTransaction,
// 		});
// 		if (result.success) {
// 			return {
// 				success: true,
// 				payload: {
// 					r: result.payload.r,
// 					s: result.payload.s,
// 					v: Number(result.payload.v),
// 				},
// 			};
// 		} else {
// 			return {
// 				success: false,
// 				payload: null as any,
// 				error: 'Failed to sign transaction',
// 			};
// 		}
// 	});
// }
//
// // Sign Ethereum message with Trezor
// export async function signEthereumMessage(
// 	wallet: TrezorWallet,
// 	message: string
// ): Promise<
// 	TrezorResponse<{
// 		address: string;
// 		signature: string;
// 	}>
// > {
// 	return await withTrezorState(async () => {
// 		const result = await TrezorConnect.ethereumSignMessage({
// 			path: wallet.path,
// 			message: message,
// 		});
// 		if (result.success) {
// 			return {
// 				success: true,
// 				payload: {
// 					address: result.payload.address,
// 					signature: result.payload.signature,
// 				},
// 			};
// 		} else {
// 			return {
// 				success: false,
// 				payload: null as any,
// 				error: 'Failed to sign message',
// 			};
// 		}
// 	});
// }

// Get public key from Trezor for Ethereum
/*export async function getTrezorEthereumPublicKey(path: string): Promise<TrezorResponse<{ publicKey: string; address: string }>> {
	return await withTrezorState(async () => {
		// Use ethereumGetAddress to get both address and public key
		const result = await TrezorConnect.ethereumGetAddress({
			path: path,
			showOnTrezor: false,
		});
		if (result.success) {
			return {
				success: true,
				payload: {
					publicKey: (result.payload as any).publicKey || '',
					address: result.payload.address,
				},
			};
		} else {
			return {
				success: false,
				payload: null as any,
				error: 'Failed to get public key',
			};
		}
	});
}*/

// Disconnect from Trezor
export async function disconnectTrezor(): Promise<void> {
	await TrezorConnect.dispose();
	//trezorConnected.set(false);
	trezorDevice.set(null);
	trezorAccounts.set([]);
	trezorWallets.set([]);
	trezorError.set(null);
}

// Verify that a wallet belongs to the connected Trezor device
/*export async function verifyTrezorWallet(wallet: TrezorWallet): Promise<boolean> {
	let currentDevice: TrezorDevice | null = get(trezorDevice);
	if (!currentDevice || (currentDevice as TrezorDevice).id !== wallet.deviceId) return false;
	// Verify by getting the address from the device
	const result = await getTrezorEthereumPublicKey(wallet.path);
	if (result.success) return result.payload.address.toLowerCase() === wallet.address.toLowerCase();
	return false;
}*/

// Get device info
/*export async function getTrezorDeviceInfo(): Promise<TrezorResponse<Features>> {
	return await withTrezorState(async () => {
		const result = await TrezorConnect.getFeatures();
		if (result.success) {
			return {
				success: true,
				payload: result.payload,
			};
		} else {
			return {
				success: false,
				payload: {} as Features,
				error: 'Failed to get device info',
			};
		}
	});
}*/

// Apply settings to device
/*export async function applyTrezorSettings(params: { label?: string; usePassphrase?: boolean; homescreen?: string }): Promise<TrezorResponse<{ message: string }>> {
	return await withTrezorState(async () => {
		const result = await TrezorConnect.applySettings({
			label: params.label,
			use_passphrase: params.usePassphrase,
			homescreen: params.homescreen,
		});
		if (result.success) {
			return {
				success: true,
				payload: { message: 'Settings applied successfully' },
			};
		} else {
			return {
				success: false,
				payload: { message: 'Failed to apply settings' },
				error: 'Failed to apply settings',
			};
		}
	});
}*/

// Reset Trezor state (for debugging or when issues occur)
export function resetTrezorState(): void {
	console.log('Resetting Trezor state...');
	// Try to dispose TrezorConnect
	try {
		TrezorConnect.dispose();
	} catch (error) {
		console.log('Error disposing TrezorConnect:', error);
	}

	// Clear initialization mutex
	initializationPromise = null;

	isInitialized.set(false);
	//trezorConnected.set(false);
	trezorDevice.set(null);
	trezorAccounts.set([]);
	trezorWallets.set([]);
	trezorError.set(null);
	trezorLoading.set(false);
}

/**
 * Sign transaction using Trezor wallet
 * This function bridges between your existing wallet system and Trezor
 */
/*export async function signTransactionWithTrezor(
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
}*/

export async function loadAccounts() {
	await getTrezorEthereumAccounts();
}
