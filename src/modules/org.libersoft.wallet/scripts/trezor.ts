import { writable } from 'svelte/store';
import type { TransactionRequest } from 'ethers';
import TrezorConnect from '@trezor/connect-web';
import type { Features } from '@trezor/connect/lib/types/device';
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
let isInitialized = false;

export async function initializeTrezor(): Promise<boolean> {
	try {
		console.log('Starting Trezor initialization...');
		// If TrezorConnect is already initialized, do nothing
		if (isInitialized) {
			console.log('Trezor already initialized, skipping...');
			return true;
		}

		console.log('TrezorConnect assigned, proceeding directly to initialization...');

		// Initialize Trezor Connect (skip state checking as it can cause issues)
		if (!isInitialized) {
			console.log('Initializing TrezorConnect with manifest...');

			// Detect browser for transport configuration
			const isFirefox = navigator.userAgent.includes('Firefox');
			const isWebUSBSupported = !!(navigator.usb && navigator.usb.requestDevice);

			const initConfig: any = {
				lazyLoad: false,
				manifest: {
					email: 'dev@libersoft.org',
					appUrl: window.location.origin,
				},
				debug: true, // Enable debug for more info
				popup: false,
				connectSrc: 'https://connect.trezor.io/9/',
				iframeSrc: 'https://connect.trezor.io/9/iframe.html',
				trustedHost: false,
				connectSrcCSP: 'https://connect.trezor.io',
			};

			// Configure transport based on browser
			if (isFirefox || !isWebUSBSupported) {
				console.log('Configuring for Bridge transport (Firefox or no WebUSB)');

				// Note: We cannot test Bridge availability directly due to CORS restrictions
				// TrezorConnect will handle Bridge communication internally
				console.log('Note: Bridge availability will be tested by TrezorConnect internally');

				initConfig.webusb = false; // Disable WebUSB
				initConfig.pendingTransportEvent = true;
			} else {
				console.log('Configuring for WebUSB transport (Chrome/Edge)');
				initConfig.webusb = true; // Enable WebUSB
			}

			await TrezorConnect.init(initConfig);

			console.log('TrezorConnect.init() completed successfully');
			// Listen for device events
			TrezorConnect.on('DEVICE_EVENT', async (event: any) => {
				console.log('Trezor device event:', event);
				if (event.type === 'device-connect') {
					// Set initial device info immediately
					trezorDevice.set(event.device);
					trezorConnected.set(true);
					trezorError.set(null);

					// Read complete features after device connection
					try {
						console.log('Reading device features after connection...');
						const featuresResult = await TrezorConnect.getFeatures();
						if (featuresResult && featuresResult.success && featuresResult.payload) {
							console.log('Device features obtained:', featuresResult.payload);
							// Update device store with complete feature information
							trezorDevice.set({
								id: featuresResult.payload.device_id || event.device?.id || 'unknown',
								path: event.device?.path || '',
								label: featuresResult.payload.label || event.device?.label || 'Trezor Device',
								state: featuresResult.payload.device_id || event.device?.state || 'unknown',
								features: {
									vendor: featuresResult.payload.vendor || 'Trezor',
									model: featuresResult.payload.model || 'Unknown',
									major_version: featuresResult.payload.major_version || 0,
									minor_version: featuresResult.payload.minor_version || 0,
									patch_version: featuresResult.payload.patch_version || 0,
								},
							});
						} else {
							console.log('Failed to get device features, using event device info');
						}
					} catch (error) {
						console.warn('Error reading device features after connection:', error);
					}
				} else if (event.type === 'device-disconnect') {
					trezorDevice.set(null);
					trezorConnected.set(false);
					trezorAccounts.set([]);
					trezorWallets.set([]);
					trezorError.set('Device disconnected');
				}
			});
			// Device events will handle connected devices automatically
			isInitialized = true;
		}
		return true;
	} catch (error) {
		console.error('Failed to initialize Trezor:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Trezor';
		// If the error is "already initialized", mark it as successful
		if (errorMessage.includes('already initialized')) {
			console.log('TrezorConnect already initialized, marking as success');
			isInitialized = true;
			trezorError.set(null);
			return true;
		}
		trezorError.set(errorMessage);
		return false;
	}
}

// Connect to Trezor device
export async function connectTrezor(): Promise<boolean> {
	// Ensure TrezorConnect is properly initialized before attempting connection
	if (!isInitialized) {
		console.log('TrezorConnect not initialized, initializing first...');
		const initResult = await initializeTrezor();
		if (!initResult) {
			console.error('Failed to initialize TrezorConnect');
			trezorError.set('Failed to initialize TrezorConnect');
			return false;
		}
	}
	try {
		console.log('Connecting to Trezor device...');
		console.log('TrezorConnect object:', TrezorConnect);
		console.log('Available methods:', Object.getOwnPropertyNames(TrezorConnect));
		trezorLoading.set(true);
		trezorError.set(null);
		// First enumerate devices to see if any are connected
		let result: any = null;
		let lastError: any = null;

		// Helper function to add timeout to promises
		const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
			return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs))]);
		};

		// Detect browser capabilities
		const isWebUSBSupported = !!(navigator.usb && navigator.usb.requestDevice);
		const browserInfo = navigator.userAgent;
		const isFirefox = browserInfo.includes('Firefox');

		console.log('Browser detection:');
		console.log('- User Agent:', browserInfo);
		console.log('- Is Firefox:', isFirefox);
		console.log('- WebUSB supported:', isWebUSBSupported);

		// First try to request WebUSB access if available (Chrome/Edge only)
		if (isWebUSBSupported && !isFirefox) {
			try {
				console.log('Requesting WebUSB access...');
				// This may prompt user to select Trezor device
				await navigator.usb.requestDevice({
					filters: [
						{ vendorId: 0x534c }, // Trezor vendor ID
						{ vendorId: 0x1209 }, // Alternative Trezor vendor ID
					],
				});
				console.log('WebUSB access granted');
			} catch (usbError) {
				console.log('WebUSB request failed or cancelled:', usbError);
				// This is not necessarily a problem, continue with normal flow
			}
		} else if (isFirefox) {
			console.log('Firefox detected - WebUSB not supported, will use Bridge transport');
			console.log('Note: Bridge communication will be handled internally by TrezorConnect');

			// Add diagnostic information for Firefox/Bridge
			console.log('Bridge diagnostic: Attempting to gather Bridge status...');
			try {
				// Check if we can access any Bridge diagnostic info
				console.log('Bridge diagnostic: getFeatures method is available');
				console.log('Bridge diagnostic: enumerate method NOT available in standard API');
			} catch (diagError) {
				console.log('Bridge diagnostic error:', diagError);
			}
		} else {
			console.log('WebUSB not supported in this browser, will use Bridge transport');
		}

		try {
			// Simplified connection approach for both Firefox and other browsers
			console.log('Attempting to connect to Trezor device...');

			// Try getFeatures with retry logic
			let retryCount = 0;
			const maxRetries = 3;
			const timeoutMs = 8000;

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
			lastError = enumerateError;

			// Check if this was a timeout or other error
			const errorMessage = enumerateError instanceof Error ? enumerateError.message : 'Unknown error';
			if (errorMessage.includes('timed out')) {
				console.log('Operation timed out - checking if this is a Bridge issue...');
				if (isFirefox) {
					lastError = new Error('Connection timed out. Please ensure:\n1. Your Trezor is connected and unlocked\n2. Trezor Bridge is running\n3. Try disconnecting and reconnecting your Trezor\n4. Restart Trezor Bridge if needed\n5. Make sure no other applications are using Trezor');
				} else {
					lastError = new Error('Connection timed out. Please ensure your Trezor is connected, unlocked, and you granted WebUSB permission.');
				}
			} else {
				// Try one more fallback with getDeviceState
				try {
					console.log('Trying TrezorConnect.getDeviceState() as final fallback...');
					result = await withTimeout(TrezorConnect.getDeviceState(), 5000);
					console.log('getDeviceState result:', result);
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
				let friendlyMessage = 'No Trezor device found. Please connect your Trezor and try again.';
				const isFirefox = navigator.userAgent.includes('Firefox');

				if (errorMessage.includes('timed out') || errorMessage.includes('timeout')) {
					if (isFirefox) {
						friendlyMessage = 'Connection timed out. Please ensure:\n1. Your Trezor is connected and unlocked\n2. Trezor Bridge is installed and running\n3. Download Bridge from: https://suite.trezor.io/bridge/';
					} else {
						friendlyMessage = 'Connection timed out. Please ensure your Trezor is connected, unlocked, and WebUSB permission is granted.';
					}
				} else if (errorMessage.includes('WebUSB permission')) {
					friendlyMessage = 'WebUSB permission required. Please grant permission to access your Trezor device.';
				} else if (errorMessage.includes('Bridge not running')) {
					friendlyMessage = 'Trezor Bridge not running. Please install and start Trezor Bridge application.';
				} else if (isFirefox) {
					friendlyMessage = 'No Trezor device found. In Firefox, you need:\n1. Trezor device connected and unlocked\n2. Trezor Bridge installed and running\n3. Download from: https://suite.trezor.io/bridge/';
				}
				trezorError.set(friendlyMessage);
				console.log('Setting user-friendly error for no device found:', friendlyMessage);
				return false;
			} else {
				// This is some other error
				console.error('Throwing last error for other issues:', lastError);
				throw lastError;
			}
		}
		if (result && result.success) {
			console.log('Successfully connected to Trezor device:', result.payload);
			trezorConnected.set(true);

			// Set device info if available
			if (result.payload) {
				trezorDevice.set({
					id: result.payload.device_id || 'unknown',
					path: result.payload.path || '',
					label: result.payload.label || 'Trezor Device',
					state: result.payload.device_id || 'unknown',
					features: {
						vendor: result.payload.vendor || 'Trezor',
						model: result.payload.model || 'Unknown',
						major_version: result.payload.major_version || 0,
						minor_version: result.payload.minor_version || 0,
						patch_version: result.payload.patch_version || 0,
					},
				});
			}
			return true;
		} else {
			console.error('Failed to connect to Trezor - result details:');
			console.error('- result:', result);
			console.error('- result type:', typeof result);
			console.error('- result.success:', result ? result.success : 'result is null/undefined');
			console.error('- result.error:', result ? result.error : 'result is null/undefined');
			console.error('- result.payload:', result ? result.payload : 'result is null/undefined');

			// Check if payload contains error information
			if (result && result.payload) {
				console.error('- payload details:', JSON.stringify(result.payload, null, 2));
				if (result.payload.error) console.error('- payload.error:', result.payload.error);
				if (result.payload.code) console.error('- payload.code:', result.payload.code);

				// Handle specific error codes
				if (result.payload.code === 'Device_CallInProgress') {
					trezorError.set('Device is busy. Please wait and try again.');
					return false;
				} else if (result.payload.code === 'Device_NotFound') {
					trezorError.set('No Trezor device found. Please connect your Trezor device.');
					return false;
				} else if (result.payload.code === 'Device_Disconnected') {
					trezorError.set('Trezor device disconnected. Please reconnect your device.');
					return false;
				}
			}

			const errorMsg = result ? result.error || result.payload?.error || 'Failed to connect to Trezor' : 'Unknown connection error - no result returned';
			console.error('Setting error message:', errorMsg);
			trezorError.set(errorMsg);
			return false;
		}
	} catch (error) {
		console.error('Error connecting to Trezor:', error);
		const errorMessage = error instanceof Error ? error.message : 'Error connecting to Trezor';
		trezorError.set(errorMessage);
		return false;
	} finally {
		trezorLoading.set(false);
	}
}

// Get Ethereum accounts from Trezor
export async function getTrezorEthereumAccounts(startIndex: number = 0, count: number = 1): Promise<TrezorAccount[]> {
	try {
		trezorLoading.set(true);
		trezorError.set(null);
		// Use getPublicKey to batch retrieve addresses
		const bundle: any[] = [];
		for (let i = startIndex; i < startIndex + count; i++) {
			bundle.push({
				path: `m/44'/60'/0'/0/${i}`,
				showOnTrezor: false,
			});
		}
		const result = await TrezorConnect.ethereumGetAddress({
			bundle: bundle,
		});
		const accounts: TrezorAccount[] = [];
		if (result.success && Array.isArray(result.payload)) {
			result.payload.forEach((item: any, index: number) => {
				accounts.push({
					address: item.address,
					path: `m/44'/60'/0'/0/${startIndex + index}`,
					publicKey: item.publicKey || '',
					name: `Trezor Account ${startIndex + index + 1}`,
				});
			});
		} else if (result.success && !Array.isArray(result.payload)) {
			// Fallback - pokud bundle nefunguje, použijeme původní metodu
			for (let i = startIndex; i < startIndex + count; i++) {
				const path = `m/44'/60'/0'/0/${i}`;
				const singleResult = await TrezorConnect.ethereumGetAddress({
					path: path,
					showOnTrezor: false,
				});
				if (singleResult.success) {
					accounts.push({
						address: singleResult.payload.address,
						path: path,
						publicKey: (singleResult.payload as any).publicKey || '',
						name: `Trezor Account ${i + 1}`,
					});
				}
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

// Create Trezor wallet from account
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

// Get all Trezor wallets
export function getTrezorWallets(): TrezorWallet[] {
	let wallets: TrezorWallet[] = [];
	const unsubscribe = trezorWallets.subscribe(w => (wallets = w));
	unsubscribe();
	return wallets;
}

// Sign Ethereum transaction with Trezor (compatible with Ethers.js)
export async function signEthereumTransaction(wallet: TrezorWallet, transaction: TransactionRequest): Promise<TrezorResponse<{ r: string; s: string; v: number }>> {
	try {
		trezorLoading.set(true);
		trezorError.set(null);
		// Convert Ethers.js transaction to Trezor format
		const trezorTransaction = {
			nonce: transaction.nonce ? `0x${transaction.nonce.toString(16)}` : '0x0',
			gasPrice: transaction.gasPrice ? `0x${transaction.gasPrice.toString(16)}` : '0x0',
			gasLimit: transaction.gasLimit ? `0x${transaction.gasLimit.toString(16)}` : '0x0',
			to: transaction.to ? transaction.to.toString() : null,
			value: transaction.value ? `0x${transaction.value.toString(16)}` : '0x0',
			data: transaction.data || '',
			chainId: Number(transaction.chainId) || 1,
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
					v: Number(result.payload.v),
				},
			};
		} else {
			return {
				success: false,
				payload: null as any,
				error: 'Failed to sign transaction',
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

// Sign Ethereum message with Trezor
export async function signEthereumMessage(wallet: TrezorWallet, message: string): Promise<TrezorResponse<{ address: string; signature: string }>> {
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
				error: 'Failed to sign message',
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

// Get public key from Trezor for Ethereum
export async function getTrezorEthereumPublicKey(path: string): Promise<TrezorResponse<{ publicKey: string; address: string }>> {
	try {
		trezorLoading.set(true);
		trezorError.set(null);
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
	} catch (error) {
		console.error('Error getting public key:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get public key';
		trezorError.set(errorMessage);
		return { success: false, payload: null as any, error: errorMessage };
	} finally {
		trezorLoading.set(false);
	}
}

// Disconnect from Trezor
export async function disconnectTrezor(): Promise<void> {
	await TrezorConnect.dispose();
	trezorConnected.set(false);
	trezorDevice.set(null);
	trezorAccounts.set([]);
	trezorWallets.set([]);
	trezorError.set(null);
}

// Verify that a wallet belongs to the connected Trezor device
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

// Remove a Trezor wallet from the store
export function removeTrezorWallet(address: string): void {
	trezorWallets.update(wallets => wallets.filter(wallet => wallet.address.toLowerCase() !== address.toLowerCase()));
}

// Get device info
export async function getTrezorDeviceInfo(): Promise<TrezorResponse<any>> {
	try {
		trezorLoading.set(true);
		trezorError.set(null);
		const result = await TrezorConnect.getFeatures();
		if (result.success) return result;
		else {
			return {
				success: false,
				payload: null,
				error: 'Failed to get device info',
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

// Apply settings to device
export async function applyTrezorSettings(params: { label?: string; usePassphrase?: boolean; homescreen?: string }): Promise<TrezorResponse<any>> {
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
				error: 'Failed to apply settings',
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

// Reset Trezor state (for debugging or when issues occur)
export function resetTrezorState(): void {
	console.log('Resetting Trezor state...');
	// Try to dispose TrezorConnect
	try {
		TrezorConnect.dispose();
	} catch (error) {
		console.log('Error disposing TrezorConnect:', error);
	}
	isInitialized = false;
	trezorConnected.set(false);
	trezorDevice.set(null);
	trezorAccounts.set([]);
	trezorWallets.set([]);
	trezorError.set(null);
	trezorLoading.set(false);
}

// Force reconnection (useful for Bridge issues)
export async function forceReconnectTrezor(): Promise<boolean> {
	console.log('Forcing Trezor reconnection...');

	try {
		// First try to dispose current connection
		console.log('Disposing existing TrezorConnect...');
		try {
			await TrezorConnect.dispose();
		} catch (disposeError) {
			console.log('Error disposing TrezorConnect:', disposeError);
		}

		// Reset state
		resetTrezorState();

		// Wait a bit
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Re-initialize
		console.log('Re-initializing Trezor...');
		const initResult = await initializeTrezor();
		if (!initResult) {
			console.error('Failed to re-initialize TrezorConnect');
			return false;
		}

		// Try to connect
		console.log('Attempting reconnection...');
		return await connectTrezor();
	} catch (error) {
		console.error('Error during force reconnection:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to force reconnect';
		trezorError.set(errorMessage);
		return false;
	}
}
