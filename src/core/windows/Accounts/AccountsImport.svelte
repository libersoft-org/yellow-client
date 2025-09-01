<script lang="ts">
	import { get } from 'svelte/store';
	import { accounts_config, accountConfigExistsByCredentials, accounts, active_account } from '@/core/scripts/core.ts';
	import { active_account_id } from '@/core/scripts/stores.ts';
	import { validateAccountsArray, validateAccountConfig } from '@/core/scripts/accounts_config.ts';
	import { ImportSuccessWithWarnings } from '@/org.libersoft.messages/scripts/utils/exceptions.ts';
	import { log } from '@/core/scripts/tauri.ts';
	import Window from '@/core/components/Window/Window.svelte';
	import Import from '@/core/components/Import/Import.svelte';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	let elWindow;
	let elDialogReplace: any = $state(null);
	let elDialogConflict: any = $state(null);
	let currentConflictAccount: any = $state(null);
	let remainingAccounts: any[] = $state([]);
	let processedCount = $state(0);
	let skippedCount = $state(0);
	let invalidAccounts: string[] = $state([]);
	let pendingReplaceText = $state('');
	let successMessage = $state('');
	let importUi: any = $state(null);
	const hasExistingAccounts = $derived($accounts_config.length > 0);
	const dataDialogReplace = {
		title: 'Replace Configuration',
		body: 'This will replace your current account configuration. All existing accounts will be lost. Are you sure you want to continue?',
		icon: 'img/import.svg',
		buttons: [
			{ img: 'img/replace.svg', text: 'Replace', onClick: confirmReplace, expand: true, testId: 'confirm-replace-btn' },
			{ img: 'img/cancel.svg', text: 'Cancel', onClick: () => elDialogReplace?.close(), expand: true, testId: 'cancel-replace-btn' },
		],
	};

	export function open() {
		elWindow?.open();
	}

	export function close() {
		elWindow?.close();
	}

	const dataDialogConflict = $derived({
		title: 'Account Already Exists',
		body: currentConflictAccount ? `Account with address "${currentConflictAccount.credentials?.address || currentConflictAccount.address}" on server "${currentConflictAccount.credentials?.server || currentConflictAccount.server}" is already configured. What would you like to do?` : '',
		icon: 'img/import.svg',
		buttons: [
			{ img: 'img/replace.svg', text: 'Replace existing', onClick: replaceConflictAccount, expand: true, testId: 'replace-existing-btn' },
			{ img: 'img/skip.svg', text: 'Skip', onClick: skipConflictAccount, expand: true, testId: 'skip-btn' },
			{ img: 'img/cancel.svg', text: 'Cancel import', onClick: () => elDialogConflict?.close(), expand: true, testId: 'cancel-import-btn' },
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

	function handleSuccess(message: string) {
		console.debug('handleSuccess:', message);
		successMessage = message;
	}

	async function handleAdd(text: string): Promise<void> {
		const newConfig = JSON.parse(text);
		remainingAccounts = [...newConfig];
		processedCount = 0;
		skippedCount = 0;
		invalidAccounts = [];
		await processNextAccount();
	}

	async function handleReplace(text: string): Promise<void> {
		const currentConfig = get(accounts_config);
		pendingReplaceText = text;

		if (currentConfig.length > 0) {
			elDialogReplace?.open();
		} else {
			await confirmReplaceWithText(text);
		}
	}

	async function processNextAccount(): Promise<void> {
		log.debug('processNextAccount: remainingAccounts.length:', remainingAccounts.length, 'processedCount:', processedCount, 'skippedCount:', skippedCount);
		if (remainingAccounts.length === 0) {
			if (processedCount > 0) {
				if (skippedCount > 0) {
					let message = `Successfully imported ${processedCount} account${processedCount > 1 ? 's' : ''}`;
					message += `\n\nSkipped ${skippedCount} invalid account${skippedCount > 1 ? 's' : ''}:`;
					invalidAccounts.forEach(error => {
						message += '\n• ' + error;
					});
					// This is a success with warnings, not an error
					throw new ImportSuccessWithWarnings(message);
				} else {
					elWindow?.close();
				}
			} else {
				let message = 'No accounts were imported';
				if (skippedCount > 0) {
					message += `, \n\n${skippedCount} account${skippedCount > 1 ? 's' : ''} skipped. `;
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
			console.debug('Invalid account skipped:', validation.errors);
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
			elDialogConflict?.open();
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
				const identifier = `${newAddress}@${newServer}`;
				return current.map(account => {
					const accountServer = account.credentials?.server;
					const accountAddress = account.credentials?.address;
					const accountIdentifier = `${accountAddress}@${accountServer}`;
					return accountIdentifier === identifier ? JSON.parse(JSON.stringify(currentConflictAccount)) : account;
				});
			});
			maybeActivateAccount();
			processedCount++;
		}
		elDialogConflict?.close();
		currentConflictAccount = null;
		await importUi.doContinue(async () => await processNextAccount());
	}

	async function skipConflictAccount() {
		skippedCount++;
		elDialogConflict?.close();
		currentConflictAccount = null;
		await importUi.doContinue(async () => await processNextAccount());
	}

	async function confirmReplace() {
		if (pendingReplaceText) {
			try {
				await confirmReplaceWithText(pendingReplaceText);
				pendingReplaceText = '';
				elDialogReplace?.close();
			} catch (err) {
				// Show error and keep dialog open so user can see the error
				elDialogReplace?.close();
				throw err;
			}
		} else elDialogReplace?.close();
	}

	async function confirmReplaceWithText(text: string) {
		// Validate first before replacing
		const validation = validateImport(text);
		if (!validation.valid) throw new Error(validation.error || 'Invalid data');
		const newConfig = JSON.parse(text);
		accounts_config.set(newConfig);
		maybeActivateAccount();
		elWindow?.close();
	}
</script>

<style>
	.success {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<Window title="Import accounts" bind:this={elWindow} testId="accounts-import" width="600px" height="700px">
	{#if successMessage}
		<div class="success">
			<Alert type="info" message={successMessage} />
			<ButtonBar expand>
				<Button img="img/cross.svg" text="Close" onClick={() => elWindow?.close()} />
			</ButtonBar>
		</div>
	{:else}
		<Import bind:this={importUi} testId="accounts" onValidate={validateImport} onAdd={handleAdd} onReplace={hasExistingAccounts ? handleReplace : undefined} onSuccess={handleSuccess} addButtonText="Add accounts" replaceButtonText="Replace All" browseButtonText="Open JSON file" qrInstructions="Point your camera at a QR code containing account configuration" />
	{/if}
</Window>
<Dialog data={dataDialogReplace} bind:this={elDialogReplace} />
<Dialog data={dataDialogConflict} bind:this={elDialogConflict} />
