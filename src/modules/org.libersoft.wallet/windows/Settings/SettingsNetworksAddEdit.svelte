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
	let itemName: string | undefined = $state();
	let itemCurrencySymbol: string | undefined = $state();
	let itemCurrencyIconURL: string | undefined = $state();
	let itemChainID: number | undefined = $state();
	let itemExplorerURL: string | undefined = $state();
	let itemRPCURLs: string[] | undefined = $state();
	let error: string | null | undefined = $state();

	export function onOpen(props: Props['params']): void {
		if (props?.network) {
			let network = props.network;
			itemName = network.name;
			itemCurrencySymbol = network.currency?.symbol || '';
			itemCurrencyIconURL = network.currency?.iconURL || '';
			itemChainID = network.chainID;
			itemExplorerURL = network.explorerURL || '';
			itemRPCURLs = network.rpcURLs ? [...network.rpcURLs] : [];
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
			name: itemName || '',
			currency: {
				symbol: itemCurrencySymbol || '',
				iconURL: itemCurrencyIconURL,
			},
			chainID: itemChainID || 0,
			rpcURLs: itemRPCURLs,
			explorerURL: itemExplorerURL,
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
			<Input bind:value={itemName} bind:this={elName} />
		</Label>
		<Label text="Currency symbol">
			<Input bind:value={itemCurrencySymbol} bind:this={elCurrencySymbol} />
		</Label>
		<Label text="Icon URL">
			<Input bind:value={itemCurrencyIconURL} />
		</Label>
		<Label text="Chain ID">
			<Input type="number" bind:value={itemChainID} bind:this={elChainID} />
		</Label>
		<Label text="Explorer URL">
			<Input bind:value={itemExplorerURL} />
		</Label>
		<Label text="RPC URLs">
			{#if itemRPCURLs}
				{#each itemRPCURLs as rpc_url, i}
					<div class="row">
						<Input bind:value={itemRPCURLs[i]} bind:this={elRPCURLs[i]} />
						<Icon img="img/del.svg" alt="Remove RPC URL" onClick={() => (itemRPCURLs = itemRPCURLs?.filter((v, j) => j !== i))} />
					</div>
				{/each}
			{/if}
		</Label>
		<Button img="img/add.svg" text="Add RPC URL" onClick={() => (itemRPCURLs = [...(itemRPCURLs || []), ''])} />
	</Form>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
	<ButtonBar expand>
		{#if params?.network?.guid}
			<Button img="img/save.svg" text="Save" onClick={addEdit} />
		{:else}
			<Button img="modules/{module.identifier}/img/network-add.svg" text="Add network" onClick={addEdit} />
		{/if}
		<Button img="img/cancel.svg" text="Cancel" onClick={close} />
	</ButtonBar>
</div>
