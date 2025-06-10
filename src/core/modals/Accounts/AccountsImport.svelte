<script lang="ts">
	import { get } from 'svelte/store';
	import { log } from '@/core/tauri.ts';
	import Import from '@/core/components/Import/Import.svelte';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	import { accounts_config, accountConfigExistsByCredentials, accounts, active_account } from '@/core/core.ts';
	import { active_account_id } from '@/core/stores.ts';
	import { validateAccountsArray, validateAccountConfig } from '@/core/accounts_config.ts';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();

	let replaceDialog: any = $state(null);
	let conflictDialog: any = $state(null);
	let currentConflictAccount: any = $state(null);
	let remainingAccounts: any[] = $state([]);
	let processedCount = $state(0);
	let skippedCount = $state(0);
	let invalidAccounts: string[] = $state([]);
	let pendingReplaceText = $state('');

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

	function validateImport(text: string): { valid: boolean; error?: string } {
		if (!text.trim()) {
			return { valid: false, error: 'No data provided' };
		}

		let newConfig;
		try {
			newConfig = JSON.parse(text);
		} catch (err) {
			return {
				valid: false,
				error: 'Invalid JSON format: ' + (err instanceof Error ? err.message : 'Unknown error'),
			};
		}

		const validation = validateAccountsArray(newConfig);
		if (!validation.valid) {
			return {
				valid: false,
				error: 'Invalid account data:\n' + validation.errors.join('\n'),
			};
		}

		return { valid: true };
	}

	async function handleAdd(text: string): Promise<void> {
		const newConfig = JSON.parse(text);
		remainingAccounts = [...newConfig];
		processedCount = 0;
		skippedCount = 0;
		invalidAccounts = [];
		try {
			await processNextAccount();
		} catch (err) {
			console.log('handleAdd caught error:', err);
			throw err;
		}
	}

	async function handleReplace(text: string): Promise<void> {
		const currentConfig = get(accounts_config);

		if (currentConfig.length > 0) {
			pendingReplaceText = text;
			replaceDialog?.open();
		} else {
			await confirmReplaceWithText(text);
		}
	}

	async function processNextAccount(): Promise<void> {
		if (remainingAccounts.length === 0) {
			// Finished processing all accounts
			if (processedCount > 0) {
				let message = `Successfully imported ${processedCount} account${processedCount > 1 ? 's' : ''}`;
				if (skippedCount > 0) {
					message += `\n\nSkipped ${skippedCount} invalid account${skippedCount > 1 ? 's' : ''}:`;
					invalidAccounts.forEach(error => {
						message += '\n• ' + error;
					});
					throw new Error(message);
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
				throw new Error(message);
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
			await processNextAccount();
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
			await processNextAccount();
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

	async function replaceConflictAccount() {
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
		await processNextAccount();
	}

	async function skipConflictAccount() {
		skippedCount++;
		conflictDialog?.close();
		currentConflictAccount = null;
		await processNextAccount();
	}

	async function confirmReplace() {
		if (pendingReplaceText) {
			await confirmReplaceWithText(pendingReplaceText);
			pendingReplaceText = '';
		}
		replaceDialog?.close();
	}

	async function confirmReplaceWithText(text: string) {
		const newConfig = JSON.parse(text);
		accounts_config.set(newConfig);
		maybeActivateAccount();
		close();
	}
</script>

<Import {close} testId="accounts" onValidate={validateImport} onAdd={handleAdd} onReplace={hasExistingAccounts ? handleReplace : undefined} addButtonText="Add accounts" replaceButtonText="Replace All" browseButtonText="Browse for JSON file" qrInstructions="Point your camera at a QR code containing account configuration" />

<Dialog data={replaceDialogData} bind:this={replaceDialog} />
<Dialog data={conflictDialogData} bind:this={conflictDialog} />
