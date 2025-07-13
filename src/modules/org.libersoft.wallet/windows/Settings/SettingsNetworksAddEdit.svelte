<script lang="ts">
	import { addNetwork, editNetwork, type INetwork } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	interface Props {
		network?: INetwork;
		edit?: boolean;
		close: () => void;
	}
	let { network, edit = false, close }: Props = $props();
	let itemName: string | undefined = $state();
	let itemCurrencySymbol: string | undefined = $state();
	let itemCurrencyIconURL: string | undefined = $state();
	let itemChainID: number | undefined = $state();
	let itemExplorerURL: string | undefined = $state();
	let itemRPCURLs: string[] | undefined = $state();
	let error: string | null | undefined = $state();
	let elName: Input | undefined;
	let elCurrencySymbol: Input | undefined;
	let elChainID: Input | undefined;
	let elRPCURLs: (Input | undefined)[] = $state([]);

	export function onOpen(): void {
		itemName = '';
		itemCurrencySymbol = '';
		itemCurrencyIconURL = '';
		itemChainID = undefined;
		itemExplorerURL = '';
		itemRPCURLs = [];
		if (network) {
			itemName = network.name;
			itemCurrencySymbol = network.currency?.symbol || '';
			itemCurrencyIconURL = network.currency?.iconURL || '';
			itemChainID = network.chainID;
			itemExplorerURL = network.explorerURL || '';
			itemRPCURLs = network.rpcURLs ? [...network.rpcURLs] : [];
		}
		error = null;
		elName?.focus();
	}

	function addEdit(): void {
		const validationConfig = [
			{ field: itemName, element: elName, trim: true, required: 'Network name is required' },
			{ field: itemCurrencySymbol, element: elCurrencySymbol, trim: true, required: 'Currency symbol is required' },
			{ field: itemCurrencyIconURL, trim: true },
			{ field: itemChainID, element: elChainID, convert: Number, required: 'Chain ID is required' },
			{ field: itemChainID, element: elChainID, validate: (v: number) => (v >= 0 && Number.isInteger(v) ? null : 'Chain ID must be a positive whole number') },
			{ field: itemExplorerURL, trim: true },
			{ field: itemRPCURLs || [], isArray: true, arrayElements: elRPCURLs, required: 'RPC URL {index} is required' },
		];
		error = validateForm(validationConfig);
		if (error) return;
		const newItem: INetwork = {
			name: itemName || '',
			currency: {
				symbol: itemCurrencySymbol || '',
				iconURL: itemCurrencyIconURL,
			},
			chainID: itemChainID || 0,
			rpcURLs: itemRPCURLs || [],
			explorerURL: itemExplorerURL,
			tokens: network?.tokens || [],
		};
		if (edit && network?.guid) {
			newItem.guid = network.guid;
			editNetwork(newItem);
		} else addNetwork(newItem);
		close();
	}
</script>

<style>
	.window-edit-network {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.row {
		display: flex;
		gap: 10px;
	}
</style>

<div class="window-edit-network">
	<Form onSubmit={addEdit}>
		<Label text="Name">
			<Input bind:value={itemName} bind:this={elName} data-testid="wallet-settings-network-name-input" />
		</Label>
		<Label text="Currency symbol">
			<Input bind:value={itemCurrencySymbol} bind:this={elCurrencySymbol} data-testid="wallet-settings-network-currency-symbol-input" />
		</Label>
		<Label text="Icon URL">
			<Input bind:value={itemCurrencyIconURL} data-testid="wallet-settings-network-icon-url-input" />
		</Label>
		<Label text="Chain ID">
			<Input type="number" bind:value={itemChainID} bind:this={elChainID} data-testid="wallet-settings-network-chain-id-input" />
		</Label>
		<Label text="Explorer URL">
			<Input bind:value={itemExplorerURL} data-testid="wallet-settings-network-explorer-url-input" />
		</Label>
		<Label text="RPC URLs">
			{#each itemRPCURLs as rpc_url, i}
				<div class="row">
					<Input bind:value={itemRPCURLs[i]} bind:this={elRPCURLs[i]} data-testid="wallet-settings-network-rpc-url-input-{i}" />
					<Icon img="img/del.svg" alt="Remove RPC URL" onClick={() => (itemRPCURLs = itemRPCURLs.filter((v, j) => j !== i))} testId="wallet-settings-network-rpc-url-remove-{i}" />
				</div>
			{/each}
		</Label>
		<Button img="img/add.svg" text="Add RPC URL" onClick={() => (itemRPCURLs = [...itemRPCURLs, ''])} data-testid="wallet-settings-network-add-rpc-url-btn" />
	</Form>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
	<ButtonBar expand>
		{#if edit}
			<Button img="img/save.svg" text="Save" onClick={addEdit} data-testid="wallet-settings-network-save-btn" />
		{:else}
			<Button img="modules/{module.identifier}/img/network-add.svg" text="Add network" onClick={addEdit} data-testid="wallet-settings-network-add-btn" />
		{/if}
		<Button img="img/cancel.svg" text="Cancel" onClick={close} data-testid="wallet-settings-network-cancel-btn" />
	</ButtonBar>
</div>
