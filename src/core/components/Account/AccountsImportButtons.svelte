<script lang="ts">
	import Button from '../Button/Button.svelte';
	import Dialog from '../Dialog/Dialog.svelte';
	import { accounts_config, accountConfigExistsByCredentials, accounts, active_account_id, active_account } from '../../core.ts';
	import { get } from 'svelte/store';
	import { log } from '@/core/tauri.ts';

	interface Props {
		importText: string;
		close: () => void;
		onError: (message: string) => void;
	}

	let { importText, close, onError }: Props = $props();

	let replaceDialog: any = $state(null);
	let closeReplaceDialog: (() => void) | undefined = $state(undefined);
	let conflictDialog: any = $state(null);
	let closeConflictDialog: (() => void) | undefined = $state(undefined);
	let currentConflictAccount: any = $state(null);
	let remainingAccounts: any[] = $state([]);
	let processedCount = $state(0);

	const hasExistingAccounts = $derived(get(accounts_config).length > 0);

	const replaceDialogData = {
		title: 'Replace Configuration',
		body: 'This will replace your current account configuration. All existing accounts will be lost. Are you sure you want to continue?',
		icon: 'img/import.svg',
		buttons: [
			{ text: 'Replace', onClick: confirmReplace, expand: true },
			{ text: 'Cancel', onClick: () => closeReplaceDialog?.(), expand: true },
		],
	};

	const conflictDialogData = $derived({
		title: 'Account Already Exists',
		body: currentConflictAccount ? `Account with address "${currentConflictAccount.credentials?.address || currentConflictAccount.address}" on server "${currentConflictAccount.credentials?.server || currentConflictAccount.server}" is already configured. What would you like to do?` : '',
		icon: 'img/import.svg',
		buttons: [
			{ text: 'Replace Existing', onClick: replaceConflictAccount, expand: true },
			{ text: 'Skip This Account', onClick: skipConflictAccount, expand: true },
			{ text: 'Cancel Import', onClick: () => closeConflictDialog?.(), expand: true },
		],
	});

	function addAccounts() {
		let newConfig;
		try {
			newConfig = JSON.parse(importText);
		} catch (err) {
			console.error('JSON.parse:', err);
			onError('Invalid JSON format');
			return;
		}

		if (!Array.isArray(newConfig) || newConfig.length === 0) {
			onError('No accounts found in import data');
			return;
		}

		remainingAccounts = [...newConfig];
		processedCount = 0;
		processNextAccount();
	}

	function processNextAccount() {
		if (remainingAccounts.length === 0) {
			// Finished processing all accounts
			if (processedCount > 0) {
				close();
			} else {
				onError('No accounts were imported');
			}
			return;
		}

		const account = remainingAccounts.shift();

		if (accountConfigExistsByCredentials(account.credentials?.server, account.credentials?.address)) {
			// Account exists, show conflict dialog
			currentConflictAccount = account;
			conflictDialog?.open();
		} else {
			// Account doesn't exist, add it
			accounts_config.update(current => [...current, account]);
			maybeActivateAccount();
			processedCount++;
			processNextAccount();
		}
	}

	function maybeActivateAccount() {
		log.debug('maybeActivateAccount: active_account:', get(active_account));
		if (get(active_account) === null) {
			log.debug('maybeActivateAccount: accounts.length:', get(accounts).length);
			if (get(accounts).length > 0) {
				const lastAccountStore = get(accounts)[get(accounts).length - 1];
				const lastAccount = get(lastAccountStore);
				const id = lastAccount.id;
				log.debug('maybeActivateAccount: setting active_account_id to last account:', id);
				active_account_id.set(id);
			}
		}
	}

	function replaceConflictAccount() {
		if (currentConflictAccount) {
			const newServer = currentConflictAccount.credentials?.server || currentConflictAccount.server;
			const newAddress = currentConflictAccount.credentials?.address || currentConflictAccount.address;

			// Find and replace the existing account
			accounts_config.update(current => {
				const identifier = `${newServer}\\\\${newAddress}`;
				return current.map(account => {
					const accountServer = account.credentials?.server;
					const accountAddress = account.credentials?.address;
					const accountIdentifier = `${accountServer}\\\\${accountAddress}`;
					return accountIdentifier === identifier ? currentConflictAccount : account;
				});
			});
			maybeActivateAccount();
			processedCount++;
		}

		closeConflictDialog?.();
		currentConflictAccount = null;
		processNextAccount();
	}

	function skipConflictAccount() {
		closeConflictDialog?.();
		currentConflictAccount = null;
		processNextAccount();
	}

	function replaceAccounts() {
		const currentConfig = get(accounts_config);

		if (currentConfig.length > 0) {
			// Show warning dialog if there are existing accounts
			replaceDialog?.open();
		} else {
			// No existing accounts, proceed directly
			confirmReplace();
		}
	}

	function confirmReplace() {
		let newConfig;
		try {
			newConfig = JSON.parse(importText);
		} catch (err) {
			onError('Invalid JSON format');
			console.error('Replace accounts error:', err);
			closeReplaceDialog?.();
		}
		accounts_config.set(newConfig);
		maybeActivateAccount();
		closeReplaceDialog?.();
		close();
	}
</script>

<style>
	.button-group {
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.button-group :global(.button) {
		min-width: 120px;
	}
</style>

<div class="button-group">
	<Button img="img/plus.svg" colorVariable="--primary-foreground" text="Add accounts" onClick={addAccounts} />
	{#if hasExistingAccounts}
		<Button img="img/import.svg" colorVariable="--primary-foreground" text="Replace All" onClick={replaceAccounts} />
	{/if}
</div>

<Dialog data={replaceDialogData} bind:close={closeReplaceDialog} bind:this={replaceDialog} />
<Dialog data={conflictDialogData} bind:close={closeConflictDialog} bind:this={conflictDialog} />
