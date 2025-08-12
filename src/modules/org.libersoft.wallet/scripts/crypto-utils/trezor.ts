import { get, writable, derived } from 'svelte/store';
import type { Device, Success, Unsuccessful } from '@trezor/connect/lib/types';
import TrezorConnectWeb, { DEVICE_EVENT as DEVICE_EVENT_WEB } from '@trezor/connect-web';
import TrezorConnectNode, { DEVICE_EVENT as DEVICE_EVENT_NODE } from '@trezor/connect';

// Use the appropriate Trezor Connect based on environment
const TrezorConnect = typeof window !== 'undefined' ? TrezorConnectWeb : TrezorConnectNode;
const DEVICE_EVENT = typeof window !== 'undefined' ? DEVICE_EVENT_WEB : DEVICE_EVENT_NODE;
import type { IAddress, IWallet } from './wallet.ts';

export interface TrezorAccount {
	address: string;
	path: string;
	publicKey?: string;
	balance?: string;
	name?: string;
}

export const trezorState = writable<any>(null);
export const trezorLoading = writable<boolean>(false);
export const trezorError = writable<string | null>(null);
export const isInitialized = writable<boolean>(false);
export const trezorDevices = writable<Map<string, Device>>(new Map());

export const staticSessionId = derived([trezorState], ([$trezorState]) => {
	return $trezorState?.device?.state?.staticSessionId;
});

export const isHwWalletActive = (wallet?: IWallet): boolean => {
	const $staticSessionId = get(staticSessionId);
	return !!$staticSessionId && $staticSessionId === wallet?.identifiers?.staticSessionId;
};

// Mutex for initialization to prevent race conditions
let initializationPromise: Promise<void> | null = null;

// Helper function to add timeout to promises
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 50000): Promise<T> => {
	return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs))]);
};

// Type guard for TrezorConnect response
function isSuccessResponse<T>(response: Success<T> | Unsuccessful): response is Success<T> {
	return response.success;
}

// Type guard for device event
function isDeviceConnectEvent(event: any): event is { type: 'device-connect'; payload: Device & { id: string } } {
	return event.type === 'device-connect';
}

// Type guard for device disconnect event
function isDeviceDisconnectEvent(event: any): event is { type: 'device-disconnect' } {
	return event.type === 'device-disconnect';
}

// Helper function to manage loading/error state for async operations
export async function withTrezorState<T>(operation: () => Promise<T>): Promise<T> {
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
	return true;
}

export async function initializeTrezor(): Promise<void> {
	//console.log('Starting Trezor initialization...');

	// If already initialized, return immediately
	if (get(isInitialized)) {
		//console.log('Trezor already initialized, skipping...');
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
		TrezorConnect.on(DEVICE_EVENT, onDeviceEvent);
		//TrezorConnect.on(UI_EVENT, (event: any) => console.log('UI_EVENT:', event));
		//TrezorConnect.on(TRANSPORT_EVENT, (event: any) => console.log('TRANSPORT_EVENT:', event));

		const initConfig: Parameters<typeof TrezorConnect.init>[0] = {
			lazyLoad: false, // Changed to false to ensure proper event handling
			manifest: {
				email: 'dev@libersoft.org',
				appName: 'Yellow Wallet',
				appUrl: window.location.origin,
			},
			debug: false,
			transportReconnect: true,
			popup: false, // must be true for trezor bridge connection
		};

		await TrezorConnect.init(initConfig);
		console.log('TrezorConnect.init() completed successfully');
		isInitialized.set(true);
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
		let m = get(trezorDevices);
		m.set(event.payload.id, event.payload);
		trezorDevices.set(m);
	} else if (isDeviceDisconnectEvent(event)) {
		console.log('Trezor device disconnected, clearing state and info');
		forgetTrezor();
	}
}

// Get Ethereum accounts from Trezor
export async function getTrezorEthereumAccounts(startIndex: number = 0, count: number = 1, w?: IWallet): Promise<TrezorAccount[]> {
	return await withTrezorState(async () => {
		const bundle: any[] = [];
		for (let i = startIndex; i < startIndex + count; i++) {
			bundle.push({
				path: `m/44'/60'/0'/0/${i}`,
				showOnTrezor: false,
			});
		}

		console.log('Requesting Trezor Ethereum addresses with bundle:', bundle);
		const result = await TrezorConnect.ethereumGetAddress({
			bundle: bundle,
			device: {
				path: w?.identifiers?.path, // no effect, seems to be ignored, and path changes anyway
				state: w?.identifiers?.staticSessionId,
			},
		});
		console.log('Trezor Ethereum addresses result:', result);

		if (result.success) {
			//await selectWallet();
		} else {
			window.alert(`Trezor error: ${JSON.stringify(result, null, 2)}`);
		}

		const accounts: TrezorAccount[] = [];
		if (result.success && Array.isArray(result.payload)) {
			result.payload.forEach((item: any, index: number) => {
				accounts.push({
					address: item.address,
					path: bundle[index].path,
				});
			});
		}
		return accounts;
	});
}

async function readDeviceState(): Promise<void> {
	// Read complete features and device state after device connection
	try {
		console.log('readDeviceState: Reading device features and state after connection...');
		const [featuresResult, deviceStateResult] = await Promise.all([TrezorConnect.getFeatures(), TrezorConnect.getDeviceState()]);

		if (isSuccessResponse(featuresResult)) {
			console.log('readDeviceState: Device features obtained:', featuresResult);
			console.log('readDeviceState: Device state obtained:', deviceStateResult);

			/*			// Update device store with complete feature information
			if (featuresResult.payload) {
				//console.log('readDeviceState: Setting device info from features payload...');
				//trezorDevice.set(createDeviceInfo(featuresResult.payload, event.payload));
			}

			// Update device state store with instance information
			if (isSuccessResponse(deviceStateResult) && deviceStateResult.payload) {
				console.log('readDeviceState: Setting device state with instance:', deviceStateResult.payload);
				trezorState.set(deviceStateResult.payload);
				trezorDevice.set({...get(trezorInfo), path: deviceStateResult.payload.path});
			}

			*/
		} else {
			console.log('readDeviceState: Failed to get device features, using event device info');
		}
	} catch (error) {
		console.warn('readDeviceState: Error reading device features after connection:', error);
	}
}

function forgetTrezor(): void {
	trezorState.set(null);
	trezorError.set(null);
}

export async function doAddHardwareAddressTrezor(w: IWallet, addresses: IAddress[], index: number, name?: string): Promise<void> {
	console.log('Adding Trezor address at index:', index);
	const path = `m/44'/60'/0'/0/${index}`;
	const result = await getTrezorEthereumAccounts(index, 1, w);
	console.log('Trezor address result:', result);
	if (result.length != 1) {
		console.error('Failed to get Trezor address for index:', index);
		return;
	}
	let res = result[0];
	let a: IAddress = {
		name: name || `Trezor Address ${index + 1}`,
		address: res.address,
		path: path,
		index: index,
	};
	addresses.push(a);
}

export async function selectWallet() {
	await connectTrezor();
	const deviceStateResult = await withTimeout(TrezorConnect.getDeviceState());
	console.log('DEVICESTATERESULT:', deviceStateResult);
	trezorState.set(deviceStateResult);
}
