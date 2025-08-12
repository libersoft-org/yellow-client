<script lang="ts">
	import { get } from 'svelte/store';
	import { networks, replaceAllNetworks, replaceExistingNetwork, addNetworkWithUniqueName, addSingleNetwork } from '@/org.libersoft.wallet/scripts/crypto-utils/network';
	import { ImportSuccessWithWarnings } from '@/org.libersoft.messages/scripts/utils/exceptions.ts';
	import Import from '@/core/components/Import/Import.svelte';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	interface Props {
		close: () => void;
	}
	let { close }: Props = $props();
	let replaceDialog: any = $state(null);
	let conflictDialog: any = $state(null);
	let currentConflictNetwork: any = $state(null);
	let remainingNetworks: any[] = $state([]);
	let processedCount = $state(0);
	let skippedCount = $state(0);
	let invalidNetworks: string[] = $state([]);
	let pendingReplaceText = $state('');
	let successMessage = $state('');
	let importUI: any = $state(null);
	const hasExistingNetworks = $derived($networks.length > 0);
	const replaceDialogData = {
		title: 'Replace Networks',
		body: 'This will replace your current network configuration. All existing networks will be lost. Are you sure you want to continue?',
		icon: 'img/import.svg',
		buttons: [
			{ img: 'img/replace.svg', text: 'Replace', onClick: confirmReplace, expand: true, testId: 'confirm-replace-btn' },
			{ img: 'img/cancel.svg', text: 'Cancel', onClick: () => replaceDialog?.close(), expand: true, testId: 'cancel-replace-btn' },
		],
	};

	const conflictDialogData = $derived({
		title: 'Network Already Exists',
		body: currentConflictNetwork ? `Network "${currentConflictNetwork.name}" already exists. What would you like to do?` : '',
		icon: 'img/import.svg',
		buttons: [
			{ text: 'Replace Existing', onClick: replaceConflictNetwork, expand: true },
			{ img: 'img/import.svg', text: 'Import with Modified Name', onClick: importWithModifiedName, expand: true },
			{ text: 'Skip This Network', onClick: skipConflictNetwork, expand: true },
			{ img: 'img/cancel.svg', text: 'Cancel Import', onClick: () => conflictDialog?.close(), expand: true },
		],
	});

	function validateImport(text: string): { valid: boolean; error?: string } {
		if (!text.trim()) return { valid: false, error: 'No data provided' };
		let networksData;
		try {
			networksData = JSON.parse(text);
		} catch (err) {
			return {
				valid: false,
				error: 'Invalid JSON format: ' + (err instanceof Error ? err.message : 'Unknown error'),
			};
		}
		if (!Array.isArray(networksData)) return { valid: false, error: 'Data must be an array of networks' };
		for (let i = 0; i < networksData.length; i++) {
			const network = networksData[i];
			if (!network.name || typeof network.name !== 'string') return { valid: false, error: `Network at index ${i} must have a valid name` };
			if (typeof network.chainID !== 'number' || network.chainID < 0) return { valid: false, error: `Network "${network.name}" must have a valid chainID` };
			if (!Array.isArray(network.rpcURLs)) return { valid: false, error: `Network "${network.name}" must have rpcURLs` };
			if (!network.currency || !network.currency.symbol) return { valid: false, error: `Network "${network.name}" must have currency information` };
		}
		return { valid: true };
	}

	function handleSuccess(message: string) {
		console.debug('handleSuccess:', message);
		successMessage = message;
	}

	async function handleAdd(text: string): Promise<void> {
		const networksData = JSON.parse(text);
		remainingNetworks = [...networksData];
		processedCount = 0;
		skippedCount = 0;
		invalidNetworks = [];
		await processNextNetwork();
	}

	async function handleReplace(text: string): Promise<void> {
		const currentNetworks = get(networks);
		pendingReplaceText = text;
		if (currentNetworks.length > 0) replaceDialog?.open();
		else await confirmReplaceWithText(text);
	}

	async function processNextNetwork(): Promise<void> {
		if (remainingNetworks.length === 0) {
			if (processedCount > 0) {
				if (skippedCount > 0) {
					let message = `Successfully imported ${processedCount} network${processedCount > 1 ? 's' : ''}`;
					message += `\n\nSkipped ${skippedCount} network${skippedCount > 1 ? 's' : ''}:`;
					invalidNetworks.forEach(error => {
						message += '\n• ' + error;
					});
					throw new ImportSuccessWithWarnings(message);
				} else close();
			} else {
				let message = 'No networks were imported';
				if (skippedCount > 0) {
					message += `, \n\n${skippedCount} network${skippedCount > 1 ? 's' : ''} skipped. `;
					invalidNetworks.forEach(error => {
						message += '\n• ' + error;
					});
				}
				throw new Error(message);
			}
			return;
		}

		const network = remainingNetworks.shift();
		const existingNetworks = get(networks);
		const existingNetwork = existingNetworks.find(n => n.name === network.name);
		if (existingNetwork) {
			currentConflictNetwork = network;
			conflictDialog?.open();
		} else {
			addSingleNetwork(network);
			processedCount++;
			await processNextNetwork();
		}
	}

	async function replaceConflictNetwork() {
		if (currentConflictNetwork) {
			replaceExistingNetwork(currentConflictNetwork);
			processedCount++;
		}
		conflictDialog?.close();
		currentConflictNetwork = null;
		await importUI.doContinue(async () => await processNextNetwork());
	}

	async function importWithModifiedName() {
		if (currentConflictNetwork) {
			addNetworkWithUniqueName(currentConflictNetwork);
			processedCount++;
		}
		conflictDialog?.close();
		currentConflictNetwork = null;
		await importUI.doContinue(async () => await processNextNetwork());
	}

	async function skipConflictNetwork() {
		skippedCount++;
		conflictDialog?.close();
		currentConflictNetwork = null;
		await importUI.doContinue(async () => await processNextNetwork());
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
		const validation = validateImport(text);
		if (!validation.valid) throw new Error(validation.error || 'Invalid data');
		const networksData = JSON.parse(text);
		replaceAllNetworks(networksData);
		close();
	}
</script>

{#if successMessage}
	<div style="display: flex; flex-direction: column; gap: 20px;">
		<Alert type="info" message={successMessage} />
		<div style="display: flex; justify-content: center;">
			<Button img="img/cross.svg" text="Close" onClick={close} />
		</div>
	</div>
{:else}
	<Import bind:this={importUI} testId="networks" onValidate={validateImport} onAdd={handleAdd} onReplace={hasExistingNetworks ? handleReplace : undefined} onSuccess={handleSuccess} addButtonText="Add networks" replaceButtonText="Replace All" browseButtonText="Open JSON file" qrInstructions="Point your camera at a QR code containing network configuration" />
{/if}
<Dialog data={replaceDialogData} bind:this={replaceDialog} />
<Dialog data={conflictDialogData} bind:this={conflictDialog} />
