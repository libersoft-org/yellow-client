import { get } from 'svelte/store';
import { isAddress } from 'ethers';
import { localStorageSharedStore } from './svelte-shared-store.ts';
// TODO: Need to handle getGuid utility - for now using simple implementation
function getGuid(): string {
	return 'guid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
}
export const addressBook = localStorageSharedStore<IAddressBookItem[]>('addressbook', []);
export interface IAddressBookItem {
	guid: string;
	name: string;
	address: string;
}
export interface IAddressBookValidationResult {
	isValid: boolean;
	error?: string;
}
export interface IAddressBookImportResult {
	success: boolean;
	error?: string;
	addedCount?: number;
}

addressBook.subscribe((value: IAddressBookItem[]) => {
	let modified = false;
	for (let i of value) {
		if (!i.guid) {
			i.guid = getGuid();
			modified = true;
		}
	}
	if (modified) addressBook.update(v => v);
});

export function findAddressBookItemByAddress(address: string): IAddressBookItem | undefined {
	const ab = get(addressBook);
	return ab.find(i => i.address === address);
}

export function findAddressBookItemByID(id: string): IAddressBookItem | undefined {
	const ab = get(addressBook);
	return ab.find(i => i.guid === id);
}

export function validateAddressBookItem(name: string | undefined, address: string | undefined, excludeItemGuid?: string): IAddressBookValidationResult {
	const trimmedName = name?.trim();
	const trimmedAddress = address?.trim();
	if (!trimmedAddress || trimmedAddress === '') return { isValid: false, error: 'Address is not set' };
	if (!isAddress(trimmedAddress)) return { isValid: false, error: 'Invalid Ethereum address format' };
	const dupe = findAddressBookItemByAddress(trimmedAddress);
	if (dupe && (!excludeItemGuid || dupe.guid !== excludeItemGuid)) return { isValid: false, error: 'Address already exists in the address book, see name: "' + (dupe.name || 'Unknown') + '"' };
	return { isValid: true };
}

export function addAddressBookItem(name: string | undefined, address: string | undefined): IAddressBookValidationResult {
	const trimmedName = name?.trim();
	const trimmedAddress = address?.trim();
	const validation = validateAddressBookItem(trimmedName, trimmedAddress);
	if (!validation.isValid) return validation;
	if (!trimmedAddress) return { isValid: false, error: 'Address is required' };
	const newItem: IAddressBookItem = {
		guid: getGuid(),
		name: trimmedName || '',
		address: trimmedAddress,
	};
	addressBook.update(currentItems => [...currentItems, newItem]);
	return { isValid: true };
}

export function editAddressBookItem(itemGuid: string, name: string | undefined, address: string | undefined): IAddressBookValidationResult {
	const trimmedName = name?.trim();
	const trimmedAddress = address?.trim();
	const validation = validateAddressBookItem(trimmedName, trimmedAddress, itemGuid);
	if (!validation.isValid) return validation;
	if (!trimmedAddress) return { isValid: false, error: 'Address is required' };
	addressBook.update(currentItems => currentItems.map(item => (item.guid === itemGuid ? { ...item, name: trimmedName || '', address: trimmedAddress } : item)));
	return { isValid: true };
}

export function deleteAddressBookItem(itemGuid: string): boolean {
	const currentItems = get(addressBook);
	const itemExists = currentItems.some(item => item.guid === itemGuid);
	if (!itemExists) return false;
	addressBook.update(currentItems => currentItems.filter(item => item.guid !== itemGuid));
	return true;
}

export function validateAddressBookImport(text: string): { valid: boolean; error?: string } {
	try {
		const data = JSON.parse(text);
		if (!Array.isArray(data)) return { valid: false, error: 'Invalid data format. Expected an array of address book items.' };
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			if (!item.name || typeof item.name !== 'string') return { valid: false, error: `Item ${i + 1}: Missing or invalid name` };
			if (!item.address || typeof item.address !== 'string') return { valid: false, error: `Item ${i + 1}: Missing or invalid address` };
			if (!item.address.match(/^0x[a-fA-F0-9]{40}$/)) return { valid: false, error: `Item ${i + 1}: Invalid Ethereum address format` };
		}
		return { valid: true };
	} catch (error) {
		return { valid: false, error: 'Invalid JSON format' };
	}
}

export function importAddressBookItems(text: string): IAddressBookImportResult {
	try {
		const data = JSON.parse(text);
		const currentAddressBook = get(addressBook);
		const newItems: IAddressBookItem[] = [];
		for (const item of data) {
			const existingItem = currentAddressBook.find(existing => existing.address.toLowerCase() === item.address.toLowerCase());
			if (!existingItem) {
				newItems.push({
					guid: item.guid || getGuid(),
					name: item.name,
					address: item.address,
				});
			}
		}
		if (newItems.length > 0) addressBook.update(items => [...items, ...newItems]);
		return { success: true, addedCount: newItems.length };
	} catch (error) {
		return { success: false, error: 'Failed to import address book items' };
	}
}

export function replaceAddressBook(text: string): IAddressBookImportResult {
	try {
		const data = JSON.parse(text);
		const processedData = data.map((item: any) => ({
			guid: item.guid || getGuid(),
			name: item.name,
			address: item.address,
		}));
		addressBook.set(processedData);
		return { success: true, addedCount: processedData.length };
	} catch (error) {
		return { success: false, error: 'Failed to replace address book' };
	}
}

export function hasAddressBookItems(): boolean {
	return get(addressBook).length > 0;
}

export function reorderAddressBook(reorderedItems: IAddressBookItem[]): void {
	addressBook.set(reorderedItems);
}
