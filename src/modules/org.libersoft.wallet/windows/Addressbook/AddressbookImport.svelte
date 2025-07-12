<script lang="ts">
	import { validateAddressBookImport, importAddressBookItems, replaceAddressBook, hasAddressBookItems } from '../../scripts/wallet.ts';
	import Import from '@/core/components/Import/Import.svelte';
	import Dialog, { type IDialogData } from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		close: () => void;
	}
	let { close }: Props = $props();
	let replaceDialog: any = $state(null);
	let pendingReplaceText = $state('');
	const hasExistingAddresses = $derived(hasAddressBookItems());
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
		return validateAddressBookImport(text);
	}

	async function handleAdd(text: string) {
		const result = importAddressBookItems(text);
		if (!result.success && result.error) {
			throw new Error(result.error);
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
		const result = replaceAddressBook(text);
		if (!result.success && result.error) {
			throw new Error(result.error);
		}
	}
</script>

<Import onValidate={validateAddressBook} onAdd={handleAdd} onReplace={handleReplace} testId="addressbook-import" addButtonText="Add to address book" replaceButtonText="Replace all" />
<Dialog data={replaceDialogData} bind:this={replaceDialog} />
