<script lang="ts">
	import { get } from 'svelte/store';
	import Import from '@/core/components/Import/Import.svelte';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import { networks } from '../../wallet.ts';
	import { ImportSuccessWithWarnings } from '@/modules/org.libersoft.messages/utils/exceptions.ts';
	import { getGuid } from '@/core/core.ts';
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
	let importUi: any = $state(null);
	const hasExistingNetworks = $derived(get(networks).length > 0);
	const replaceDialogData = {
		title: 'Replace Networks',
		body: 'This will replace your current network configuration. All existing networks will be lost. Are you sure you want to continue?',
		icon: 'img/import.svg',
		buttons: [
			{ text: 'Replace', onClick: confirmReplace, expand: true, 'data-testid': 'confirm-replace-btn' },
			{ img: 'img/cancel.svg', text: 'Cancel', onClick: () => replaceDialog?.close(), expand: true, 'data-testid': 'cancel-replace-btn' },
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
		if (!text.trim()) {
			return { valid: false, error: 'No data provided' };
		}

		let networksData;
		try {
			networksData = JSON.parse(text);
		} catch (err) {
			return {
				valid: false,
				error: 'Invalid JSON format: ' + (err instanceof Error ? err.message : 'Unknown error'),
			};
		}

		if (!Array.isArray(networksData)) {
			return { valid: false, error: 'Data must be an array of networks' };
		}

		// Validate each network
		for (let i = 0; i < networksData.length; i++) {
			const network = networksData[i];
			if (!network.name || typeof network.name !== 'string') {
				return { valid: false, error: `Network at index ${i} must have a valid name` };
			}
			if (!network.chainID || typeof network.chainID !== 'number') {
				return { valid: false, error: `Network "${network.name}" must have a valid chainID` };
			}
			if (!network.rpcURLs || !Array.isArray(network.rpcURLs) || network.rpcURLs.length === 0) {
				return { valid: false, error: `Network "${network.name}" must have at least one RPC URL` };
			}
			if (!network.currency || !network.currency.symbol) {
				return { valid: false, error: `Network "${network.name}" must have currency information` };
			}
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

		if (currentNetworks.length > 0) {
			replaceDialog?.open();
		} else {
			await confirmReplaceWithText(text);
		}
	}

	function generateUniqueNetworkName(baseName: string): string {
		const existingNetworks = get(networks);
		let counter = 1;
		let newName = `${baseName} (${counter})`;

		while (existingNetworks.find(n => n.name === newName)) {
			counter++;
			newName = `${baseName} (${counter})`;
		}

		return newName;
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
				} else {
					close();
				}
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
			// Network exists, show conflict dialog
			currentConflictNetwork = network;
			conflictDialog?.open();
		} else {
			// Network doesn't exist, add it
			// Ensure network has a GUID
			if (!network.guid) {
				network.guid = getGuid();
			}
			networks.update(current => [...current, network]);
			processedCount++;
			await processNextNetwork();
		}
	}

	async function replaceConflictNetwork() {
		if (currentConflictNetwork) {
			// Find and replace the existing network, preserving the existing GUID
			networks.update(current => {
				return current.map(network => {
					if (network.name === currentConflictNetwork.name) {
						return {
							...currentConflictNetwork,
							guid: network.guid, // Preserve existing GUID
						};
					}
					return network;
				});
			});
			processedCount++;
		}

		conflictDialog?.close();
		currentConflictNetwork = null;
		await importUi.doContinue(async () => await processNextNetwork());
	}

	async function importWithModifiedName() {
		if (currentConflictNetwork) {
			const uniqueName = generateUniqueNetworkName(currentConflictNetwork.name);
			const networkWithUniqueName = {
				...currentConflictNetwork,
				name: uniqueName,
				guid: getGuid(), // Generate new GUID for the modified network
			};

			networks.update(current => [...current, networkWithUniqueName]);
			processedCount++;
		}

		conflictDialog?.close();
		currentConflictNetwork = null;
		await importUi.doContinue(async () => await processNextNetwork());
	}

	async function skipConflictNetwork() {
		skippedCount++;
		conflictDialog?.close();
		currentConflictNetwork = null;
		await importUi.doContinue(async () => await processNextNetwork());
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
		} else {
			replaceDialog?.close();
		}
	}

	async function confirmReplaceWithText(text: string) {
		const validation = validateImport(text);
		if (!validation.valid) throw new Error(validation.error || 'Invalid data');
		const networksData = JSON.parse(text);
		// Ensure all networks have GUIDs
		const networksWithGuids = networksData.map((network: any) => {
			if (!network.guid) {
				return { ...network, guid: getGuid() };
			}
			return network;
		});
		networks.set(networksWithGuids);
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
	<Import bind:this={importUi} {close} testId="networks" onValidate={validateImport} onAdd={handleAdd} onReplace={hasExistingNetworks ? handleReplace : undefined} onSuccess={handleSuccess} addButtonText="Add networks" replaceButtonText="Replace All" browseButtonText="Open JSON file" qrInstructions="Point your camera at a QR code containing network configuration" />
{/if}

<Dialog data={replaceDialogData} bind:this={replaceDialog} />
<Dialog data={conflictDialogData} bind:this={conflictDialog} />
