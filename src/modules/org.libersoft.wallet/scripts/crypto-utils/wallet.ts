import { get, writable, derived } from 'svelte/store';
import { localStorageSharedStore } from './svelte-shared-store.ts';
import { getIndexedAccountPath, HDNodeWallet, Mnemonic, randomBytes } from 'ethers';
import { doAddHardwareAddressTrezor } from './trezor.ts';
import { doAddHardwareAddressLedger } from './ledger.ts';

export interface IWallet {
	guid: string;
	type?: 'software' | 'trezor' | 'ledger';
	name: string;
	phrase?: string;
	address?: string;
	selected_address_index: number;
	addresses?: IAddress[];
	identifiers?: any; // For hardware wallets, this can include deviceId
}

export interface IAddress {
	address: string;
	name: string;
	path: string;
	index: number;
}

export const wallets = localStorageSharedStore<IWallet[]>('wallets', []);
export const selectedWalletID = localStorageSharedStore<string | null>('selectedWalletID', null);
export const selectedWallet = derived([wallets, selectedWalletID], ([$wallets, $selectedWalletID]) => {
	const r = $wallets.find(w => w.guid === $selectedWalletID);
	return r;
});
export const selectedAddress = derived([selectedWallet], ([$selectedWallet]) => {
	let addresses = $selectedWallet?.addresses || [];
	let result = addresses.find(a => a.index === $selectedWallet?.selected_address_index);
	return result;
});
export let sendAddress = writable<string | number | undefined>();

export function setSendAddress(address: string) {
	if (get(sendAddress) !== address) sendAddress.set(address);
}

function sortAddresses(addresses: IAddress[]): IAddress[] {
	return addresses.sort((a, b) => a.index - b.index);
}

export function addressesMaxIndex(addresses: IAddress[]): number {
	return addresses.reduce((max, a) => Math.max(max, a.index), -1);
}

export async function addAddress(w: IWallet, index?: number | string, name?: string): Promise<void> {
	let indexNum: number;
	const addresses = w.addresses || [];
	if (index === undefined || index === null || index === '') {
		indexNum = addressesMaxIndex(addresses) + 1;
		await doAddAddress(w, addresses, indexNum, name);
	} else {
		indexNum = parseInt(index.toString());
		if (indexNum < 0 || isNaN(indexNum)) {
			console.error('Invalid index');
			return;
		}
		const existing = addresses.find(a => a.index === indexNum);
		if (existing) {
			console.error('Address with index', indexNum, 'already exists');
			return;
		}
		await doAddAddress(w, addresses, indexNum, name);
	}
	w.addresses = addresses;
	w.selected_address_index = indexNum;
	wallets.update(ws =>
		ws.map(item =>
			item.guid === w.guid
				? {
						...item,
						addresses: [...addresses],
						selected_address_index: indexNum,
					}
				: item
		)
	);
}

export function addressIndexAlreadyExists(wallet: IWallet, index: number): boolean {
	if (wallet?.addresses) return wallet.addresses.some(address => address.index === index);
	else return false;
}

async function doAddAddress(w: IWallet, addresses: IAddress[], index: number, name?: string): Promise<void> {
	if (isHardwareWallet(w)) {
		if (w.type === 'trezor') {
			await doAddHardwareAddressTrezor(w, addresses, index, name);
		} else if (w.type === 'ledger') {
			await doAddHardwareAddressLedger(w, addresses, index, name);
		}
	} else {
		doAddSoftwareAddress(w, addresses, index, name);
	}
}

function doAddSoftwareAddress(w: IWallet, addresses: IAddress[], index: number, name?: string): void {
	if (!w.phrase) {
		console.error('Cannot derive address: wallet.phrase is undefined');
		return;
	}
	let mn = Mnemonic.fromPhrase(w.phrase);
	let path = getIndexedAccountPath(index);
	let derived_wallet = HDNodeWallet.fromMnemonic(mn, path);
	let a: IAddress = {
		address: derived_wallet.address,
		name: name || 'Address ' + index,
		path: path,
		index: index,
	};
	addresses.push(a);
}

export function selectAddress(wallet: IWallet, address: IAddress): void {
	wallet.selected_address_index = address.index;
	wallets.update(v => v);
	selectedWalletID.set(wallet.guid);
}

export function generateMnemonic(): Mnemonic {
	return Mnemonic.fromEntropy(randomBytes(32));
}

export async function addWallet(mnemonic: Mnemonic, name?: string): Promise<void> {
	let newWallet = HDNodeWallet.fromMnemonic(mnemonic);
	let wallet: IWallet = {
		guid: 'swwallet-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15),
		type: 'software',
		phrase: mnemonic.phrase,
		address: newWallet.address,
		selected_address_index: 0,
		name: '',
		addresses: [],
	};
	wallets.update(w => {
		wallet.name = name ? name : 'My wallet ' + (w.length + 1);
		w.push(wallet);
		return w;
	});
	selectedWalletID.set(get(wallets)[get(wallets).length - 1].guid);
	await addAddress(wallet);
}

export function editWallet(wallet: IWallet, name: string): boolean {
	let success = false;
	wallets.update(w => {
		const index = w.findIndex(item => item === wallet);
		if (index !== -1) {
			w[index] = { ...w[index], name };
			success = true;
		}
		return w;
	});
	return success;
}

export function deleteWallet(wallet: IWallet): boolean {
	let success = false;
	const currentSelectedWalletID = get(selectedWalletID);
	wallets.update(w => {
		const index = w.findIndex(item => item.guid === wallet.guid);
		if (index !== -1) {
			w.splice(index, 1);
			success = true;
		}
		return w;
	});
	if (success && currentSelectedWalletID === wallet.guid) {
		const remainingWallets = get(wallets);
		if (remainingWallets.length > 0) selectedWalletID.set(remainingWallets[0].guid);
		else selectedWalletID.set(null);
	}
	return success;
}

export function deleteAddressFromWallet(wallet: IWallet, index: string | number): void {
	wallets.update(ws =>
		ws.map(item =>
			item.guid === wallet.guid
				? {
						...item,
						addresses: (item.addresses ?? []).filter(a => a.index !== index),
					}
				: item
		)
	);
}

export function editAddressName(wallet: IWallet, index: string | number, name: string): void {
	wallets.update(ws =>
		ws.map(w =>
			w.guid === wallet.guid
				? {
						...w,
						addresses: (w.addresses || []).map(a => (a.index === index ? { ...a, name } : a)),
					}
				: w
		)
	);
}

export function reorderWallets(reorderedWallets: IWallet[]): void {
	wallets.set(reorderedWallets);
}

export function reorderAddresses(wallet: IWallet, reorderedAddresses: IAddress[]): void {
	wallets.update(ws => ws.map(w => (w.guid === wallet.guid ? { ...w, addresses: [...reorderedAddresses] } : w)));
}

export async function addHardwareWallet(type: 'trezor' | 'ledger', name: string, identifiers: any): Promise<void> {
	console.log('Adding hardware wallet:', type, name, identifiers);
	const wallet: IWallet = {
		guid: 'hwwallet-' + type + Date.now() + '-' + Math.random().toString(36).substring(2, 15),
		type,
		name,
		selected_address_index: 0,
		identifiers,
	};
	wallets.update(w => {
		w.push(wallet);
		return w;
	});
	selectedWalletID.set(wallet.guid);
}

export function isHardwareWallet(wallet: IWallet): boolean {
	return wallet.type === 'trezor' || wallet.type === 'ledger';
}

export function isTrezorWallet(wallet: IWallet): boolean {
	return wallet.type === 'trezor';
}

wallets.subscribe(wallets => {
	wallets_cleanup(wallets);
});

function wallets_cleanup(wallets: any) {
	for (let i = 0; i < wallets.length; i++) {
		if (!wallets[i].guid) {
			console.warn('Wallet at index ' + i + ' does not have a guid, removing it');
			wallets[i].guid = 'wallet-' + i + '-' + Date.now();
		}
		if (!wallets[i].type) {
			console.warn('Wallet at index ' + i + ' does not have a type, setting it to software');
			wallets[i].type = 'software';
		}
	}
}
