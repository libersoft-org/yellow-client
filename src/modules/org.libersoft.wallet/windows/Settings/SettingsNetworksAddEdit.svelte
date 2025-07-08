<script lang="ts">
	import { networks, type INetwork } from '../../scripts/wallet.ts';
	import { module } from '../../scripts/module.ts';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	let elName: Input | undefined;
	let elCurrencySymbol: Input | undefined;
	let elChainID: Input | undefined;
	let elRPCURLs: (Input | undefined)[] = $state([]);
	interface Props {
		params?: {
			network?: INetwork;
		};
		close: () => void;
	}
	let { params, close }: Props = $props();
	let itemName = $state({ value: undefined as string | undefined });
	let itemCurrencySymbol = $state({ value: undefined as string | undefined });
	let itemCurrencyIconURL = $state({ value: undefined as string | undefined });
	let itemChainID = $state({ value: undefined as number | undefined });
	let itemExplorerURL = $state({ value: undefined as string | undefined });
	let itemRPCURLs = $state({ value: undefined as string[] | undefined });
	let error: string | null | undefined = $state();

	export function onOpen(props: Props['params']): void {
		if (props?.network) {
			let network = props.network;
			itemName.value = network.name;
			itemCurrencySymbol.value = network.currency?.symbol || '';
			itemCurrencyIconURL.value = network.currency?.iconURL || '';
			itemChainID.value = network.chainID;
			itemExplorerURL.value = network.explorerURL || '';
			itemRPCURLs.value = network.rpcURLs ? [...network.rpcURLs] : [];
			elName?.focus();
		}
	}

	$effect(() => {
		onOpen(params);
	});

	function addEdit(): void {
		const validationConfig = [
			{ field: itemName, element: elName, trim: true, required: 'Network name is required' },
			{ field: itemCurrencySymbol, element: elCurrencySymbol, trim: true, required: 'Currency symbol is required' },
			{ field: itemCurrencyIconURL, trim: true },
			{ field: itemChainID, element: elChainID, convert: Number, required: 'Chain ID is required' },
			{ field: itemChainID, element: elChainID, validate: (v: number) => (v >= 0 && Number.isInteger(v) ? null : 'Chain ID must be a positive whole number') },
			{ field: itemExplorerURL, trim: true },
			{ field: itemRPCURLs, isArray: true, arrayElements: elRPCURLs, required: 'RPC URL {index} is required' },
		];

		error = validateForm(validationConfig);
		if (error) return;

		const newItem: INetwork = {
			name: itemName.value || '',
			currency: {
				symbol: itemCurrencySymbol.value || '',
				iconURL: itemCurrencyIconURL.value,
			},
			chainID: itemChainID.value || 0,
			rpcURLs: itemRPCURLs.value,
			explorerURL: itemExplorerURL.value,
		};

		if (params?.network?.guid) {
			// Edit
			newItem.guid = params.network.guid;
			networks.update(networks => {
				const index = networks.findIndex(v => v.guid === params?.network?.guid);
				if (index !== -1) networks[index] = newItem;
				return networks;
			});
		} else {
			// Add
			$networks.push(newItem);
			networks.set($networks);
		}
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
			<Input bind:value={itemName.value} bind:this={elName} data-testid="wallet-settings-network-name-input" />
		</Label>
		<Label text="Currency symbol">
			<Input bind:value={itemCurrencySymbol.value} bind:this={elCurrencySymbol} data-testid="wallet-settings-network-currency-symbol-input" />
		</Label>
		<Label text="Icon URL">
			<Input bind:value={itemCurrencyIconURL.value} data-testid="wallet-settings-network-icon-url-input" />
		</Label>
		<Label text="Chain ID">
			<Input type="number" bind:value={itemChainID.value} bind:this={elChainID} data-testid="wallet-settings-network-chain-id-input" />
		</Label>
		<Label text="Explorer URL">
			<Input bind:value={itemExplorerURL.value} data-testid="wallet-settings-network-explorer-url-input" />
		</Label>
		<Label text="RPC URLs">
			{#if itemRPCURLs.value}
				{#each itemRPCURLs.value as rpc_url, i}
					<div class="row">
						<Input bind:value={itemRPCURLs.value[i]} bind:this={elRPCURLs[i]} data-testid="wallet-settings-network-rpc-url-input-{i}" />
						<Icon img="img/del.svg" alt="Remove RPC URL" onClick={() => (itemRPCURLs.value = itemRPCURLs.value?.filter((v, j) => j !== i))} testId="wallet-settings-network-rpc-url-remove-{i}" />
					</div>
				{/each}
			{/if}
		</Label>
		<Button img="img/add.svg" text="Add RPC URL" onClick={() => (itemRPCURLs.value = [...(itemRPCURLs.value || []), ''])} data-testid="wallet-settings-network-add-rpc-url-btn" />
	</Form>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
	<ButtonBar expand>
		{#if params?.network?.guid}
			<Button img="img/save.svg" text="Save" onClick={addEdit} data-testid="wallet-settings-network-save-btn" />
		{:else}
			<Button img="modules/{module.identifier}/img/network-add.svg" text="Add network" onClick={addEdit} data-testid="wallet-settings-network-add-btn" />
		{/if}
		<Button img="img/cancel.svg" text="Cancel" onClick={close} data-testid="wallet-settings-network-cancel-btn" />
	</ButtonBar>
</div>
