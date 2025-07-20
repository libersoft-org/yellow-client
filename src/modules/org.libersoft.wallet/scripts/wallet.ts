import { get, writable, derived } from 'svelte/store';
import { localStorageSharedStore } from '@/lib/svelte-shared-store.ts';
import { getIndexedAccountPath, HDNodeWallet, Mnemonic, randomBytes } from 'ethers';
export interface IWallet {
	type?: 'software' | 'trezor' | 'ledger';
	phrase?: string; // optional pro HW wallets
	address: string;
	selected_address_index: number;
	name: string;
	addresses?: IAddress[];
	// For HW wallets:
	deviceId?: string;
	devicePath?: string; // HD derivation path
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
	const r = $wallets.find(w => w.address === $selectedWalletID);
	return r;
});
export const selectedAddress = derived([selectedWallet], ([$selectedWallet]) => {
	let addresses = $selectedWallet?.addresses || [];
	let result = addresses.find(a => a.index === $selectedWallet?.selected_address_index);
	return result;
});
export let sendAddress = writable<string | number | undefined>();

wallets.subscribe((wals: IWallet[]) => {
	while (wallets_cleanup(wals)) {
		wallets.update(w => w);
	}
});

function wallets_cleanup(wallets: any) {
	for (let i = 0; i < wallets.length; i++) {
		for (let j = 0; j < wallets.length; j++) {
			if (i !== j && wallets[i].address === wallets[j].address) {
				console.error('Wallet with address ' + wallets[i].address + ' already exists');
				wallets.splice(i, 1);
				return true;
			}
			if (i !== j && wallets[i].phrase === wallets[j].phrase) {
				console.error('Wallet with phrase ' + wallets[i].phrase + ' already exists');
				wallets.splice(i, 1);
				return true;
			}
		}
	}
}

export function setSendAddress(address: string) {
	if (get(sendAddress) !== address) sendAddress.set(address);
}

function sortAddresses(addresses: IAddress[]): IAddress[] {
	return addresses.sort((a, b) => a.index - b.index);
}

export function addressesMaxIndex(addresses: IAddress[]): number {
	return addresses.reduce((max, a) => Math.max(max, a.index), -1);
}

export function addAddress(w: IWallet, index?: number | string, name?: string): void {
	let indexNum: number;
	const addresses = w.addresses || [];
	sortAddresses(addresses);
	if (index === undefined || index === null || index === '') {
		indexNum = addressesMaxIndex(addresses) + 1;
		doAddAddress(w, addresses, indexNum, name);
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
		doAddAddress(w, addresses, indexNum, name);
	}
	sortAddresses(addresses);
	w.addresses = addresses;
	w.selected_address_index = indexNum;
	wallets.update(ws =>
		ws.map(item =>
			item.address === w.address
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

function doAddAddress(w: IWallet, addresses: IAddress[], index: number, name?: string): void {
	// For hardware wallets, addresses are not added this way
	if (isHardwareWallet(w)) {
		console.error('Cannot add addresses to hardware wallets this way. Use hardware wallet specific methods.');
		return;
	}
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
	selectedWalletID.set(wallet.address);
}

export function generateMnemonic(): Mnemonic {
	return Mnemonic.fromEntropy(randomBytes(32));
}

export async function addWallet(mnemonic: Mnemonic, name?: string): Promise<void> {
	let newWallet = HDNodeWallet.fromMnemonic(mnemonic);
	let wallet: IWallet = {
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
	selectedWalletID.set(get(wallets)[get(wallets).length - 1].address);
	addAddress(wallet);
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
		const index = w.findIndex(item => item.address === wallet.address);
		if (index !== -1) {
			w.splice(index, 1);
			success = true;
		}
		return w;
	});
	if (success && currentSelectedWalletID === wallet.address) {
		const remainingWallets = get(wallets);
		if (remainingWallets.length > 0) selectedWalletID.set(remainingWallets[0].address);
		else selectedWalletID.set(null);
	}
	return success;
}

export function deleteAddressFromWallet(wallet: IWallet, index: string | number): void {
	wallets.update(ws => ws.map(item => (item.address === wallet.address ? { ...item, addresses: (item.addresses ?? []).filter(a => a.index !== index) } : item)));
}

export function editAddressName(wallet: IWallet, index: string | number, name: string): void {
	wallets.update(ws =>
		ws.map(w =>
			w.address === wallet.address
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
	wallets.update(ws => ws.map(w => (w.address === wallet.address ? { ...w, addresses: [...reorderedAddresses] } : w)));
}

export async function addHardwareWallet(type: 'trezor' | 'ledger', address: string, name: string, deviceId: string, devicePath: string): Promise<void> {
	const wallet: IWallet = {
		type,
		address,
		selected_address_index: 0,
		name,
		deviceId,
		devicePath,
		addresses: [
			{
				address,
				name: 'Main Account',
				path: devicePath,
				index: 0,
			},
		],
	};
	wallets.update(w => {
		w.push(wallet);
		return w;
	});
	selectedWalletID.set(address);
}

export function isHardwareWallet(wallet: IWallet): boolean {
	return wallet.type === 'trezor' || wallet.type === 'ledger';
}

export function isTrezorWallet(wallet: IWallet): boolean {
	return wallet.type === 'trezor';
}
