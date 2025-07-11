<script lang="ts">
	import { get } from 'svelte/store';
	import { getGuid } from '@/core/scripts/utils/utils.ts';
	import { addressBook } from '../../scripts/wallet.ts';
	import Import from '@/core/components/Import/Import.svelte';
	import Dialog, { type IDialogData } from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		close: () => void;
	}
	let { close }: Props = $props();
	let replaceDialog: any = $state(null);
	let pendingReplaceText = $state('');
	const hasExistingAddresses = $derived($addressBook.length > 0);
	const replaceDialogData: IDialogData = {
		title: 'Replace Address Book',
		body: 'This will replace your current address book. All existing addresses will be lost. Are you sure you want to continue?',
		icon: 'img/import.svg',
		buttons: [
			{ text: 'Replace All', onClick: confirmReplace, testId: 'confirm-replace-btn' },
			{ img: 'img/cancel.svg', text: 'Cancel', onClick: () => replaceDialog?.close(), testId: 'cancel-replace-btn' },
		],
	};

	function validateAddressBook(text: string) {
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

	async function handleAdd(text: string) {
		const data = JSON.parse(text);
		const currentAddressBook = get(addressBook);
		const newItems: any[] = [];
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
		if (newItems.length > 0) {
			addressBook.update(items => [...items, ...newItems]);
		}
	}

	async function handleReplace(text: string) {
		pendingReplaceText = text;
		if (hasExistingAddresses) replaceDialog?.open();
		else await confirmReplaceWithText(text);
	}

	async function confirmReplace() {
		if (pendingReplaceText) {
			try {
				await confirmReplaceWithText(pendingReplaceText);
				pendingReplaceText = '';
				replaceDialog?.close();
			} catch (err) {
				replaceDialog?.close();
				throw err;
			}
		} else replaceDialog?.close();
	}

	async function confirmReplaceWithText(text: string) {
		const data = JSON.parse(text);
		const processedData = data.map((item: any) => ({
			guid: item.guid || getGuid(),
			name: item.name,
			address: item.address,
		}));
		addressBook.set(processedData);
	}
</script>

<Import onValidate={validateAddressBook} onAdd={handleAdd} onReplace={handleReplace} testId="addressbook-import" addButtonText="Add to address book" replaceButtonText="Replace all" />
<Dialog data={replaceDialogData} bind:this={replaceDialog} />
