<script lang="ts">
	import { get } from 'svelte/store';
	import { log } from '@/core/tauri.ts';
	import Button from '@/core/components/Button/Button.svelte';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	import { accounts_config, accountConfigExistsByCredentials, accounts, active_account_id, active_account } from '@/core/core.ts';
	import { validateAccountsArray, validateAccountConfig } from '@/core/accounts_config.ts';

	interface Props {
		importText: string;
		close: () => void;
		onError: (message: string) => void;
	}

	let { importText, close, onError }: Props = $props();

	let replaceDialog: any = $state(null);
	let conflictDialog: any = $state(null);
	let currentConflictAccount: any = $state(null);
	let remainingAccounts: any[] = $state([]);
	let processedCount = $state(0);
	let skippedCount = $state(0);
	let invalidAccounts: string[] = $state([]);

	const hasExistingAccounts = $derived(get(accounts_config).length > 0);

	const replaceDialogData = {
		title: 'Replace Configuration',
		body: 'This will replace your current account configuration. All existing accounts will be lost. Are you sure you want to continue?',
		icon: 'img/import.svg',
		buttons: [
			{ text: 'Replace', onClick: confirmReplace, expand: true, 'data-testid': 'confirm-replace-btn' },
			{ text: 'Cancel', onClick: () => replaceDialog?.close(), expand: true, 'data-testid': 'cancel-replace-btn' },
		],
	};

	const conflictDialogData = $derived({
		title: 'Account Already Exists',
		body: currentConflictAccount ? `Account with address "${currentConflictAccount.credentials?.address || currentConflictAccount.address}" on server "${currentConflictAccount.credentials?.server || currentConflictAccount.server}" is already configured. What would you like to do?` : '',
		icon: 'img/import.svg',
		buttons: [
			{ text: 'Replace Existing', onClick: replaceConflictAccount, expand: true },
			{ text: 'Skip This Account', onClick: skipConflictAccount, expand: true },
			{ text: 'Cancel Import', onClick: () => conflictDialog?.close(), expand: true },
		],
	});

	function addAccounts() {
		let newConfig;
		try {
			newConfig = JSON.parse(importText);
		} catch (err) {
			console.error('JSON.parse:', err);
			onError('Invalid JSON format: ' + (err instanceof Error ? err.message : 'Unknown error'));
			return;
		}

		// Validate the imported data structure
		const validation = validateAccountsArray(newConfig);
		if (!validation.valid) {
			onError('Invalid account data:\n' + validation.errors.join('\n'));
			console.error('Add accounts validation errors:', validation.errors);
			return;
		}

		remainingAccounts = [...newConfig];
		processedCount = 0;
		skippedCount = 0;
		invalidAccounts = [];
		processNextAccount();
	}

	function processNextAccount() {
		if (remainingAccounts.length === 0) {
			// Finished processing all accounts
			if (processedCount > 0) {
				let message = `Successfully imported ${processedCount} account${processedCount > 1 ? 's' : ''}`;
				if (skippedCount > 0) {
					message += `\n\nSkipped ${skippedCount} invalid account${skippedCount > 1 ? 's' : ''}:`;
					invalidAccounts.forEach(error => {
						message += '\n• ' + error;
					});
				}
				if (skippedCount > 0) {
					onError(message);
				} else {
					close();
				}
			} else {
				let message = 'No accounts were imported';
				if (skippedCount > 0) {
					message += `\n\n${skippedCount} invalid account${skippedCount > 1 ? 's' : ''} skipped:`;
					invalidAccounts.forEach(error => {
						message += '\n• ' + error;
					});
				}
				onError(message);
			}
			return;
		}

		const account = remainingAccounts.shift();
		const accountIndex = get(accounts_config).length + processedCount + skippedCount + 1;

		// Validate individual account before processing
		const validation = validateAccountConfig(account);
		if (!validation.valid) {
			console.error('Invalid account skipped:', validation.errors);
			skippedCount++;
			const accountIdentifier = account?.credentials?.address || account?.address || `Account ${accountIndex}`;
			invalidAccounts.push(`${accountIdentifier}: ${validation.errors.join(', ')}`);
			// Skip this account and continue with the next one
			processNextAccount();
			return;
		}

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
					return accountIdentifier === identifier ? JSON.parse(JSON.stringify(currentConflictAccount)) : account;
				});
			});
			maybeActivateAccount();
			processedCount++;
		}

		conflictDialog?.close();
		currentConflictAccount = null;
		processNextAccount();
	}

	function skipConflictAccount() {
		conflictDialog?.close();
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
			onError('Invalid JSON format: ' + (err instanceof Error ? err.message : 'Unknown error'));
			console.error('Replace accounts JSON parse error:', err);
			replaceDialog?.close();
			return;
		}

		// Validate the imported data
		const validation = validateAccountsArray(newConfig);
		if (!validation.valid) {
			onError('Invalid account data:\n' + validation.errors.join('\n'));
			console.error('Replace accounts validation errors:', validation.errors);
			replaceDialog?.close();
			return;
		}

		// If validation passes, replace the accounts
		accounts_config.set(newConfig);
		maybeActivateAccount();
		replaceDialog?.close();
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
	<Button img="img/plus.svg" colorVariable="--primary-foreground" text="Add accounts" onClick={addAccounts} data-testid="add-accounts-btn" />
	{#if hasExistingAccounts}
		<Button img="img/import.svg" colorVariable="--primary-foreground" text="Replace All" onClick={replaceAccounts} data-testid="replace-all-btn" />
	{/if}
</div>

<Dialog data={replaceDialogData} bind:this={replaceDialog} />
<Dialog data={conflictDialogData} bind:this={conflictDialog} />
