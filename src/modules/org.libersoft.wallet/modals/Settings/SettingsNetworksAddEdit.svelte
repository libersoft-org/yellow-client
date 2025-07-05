<script lang="ts">
	import { networks, type INetwork } from '../../scripts/wallet.ts';
	import { module } from '../../scripts/module.ts';
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
	let itemGUID: string | undefined;
	let itemName: string | undefined = $state();
	let itemCurrencySymbol: string | undefined = $state();
	let itemCurrencyIconURL: string | undefined = $state();
	let itemChainID: number | undefined = $state();
	let itemExplorerURL: string | undefined = $state();
	let itemRPCURLs: string[] | undefined = $state();
	let error: string | null | undefined = $state();

	export function onOpen(): void {
		console.log('onOpen - params', params);
		if (itemGUID) return;
		let item: INetwork | null | undefined = params?.network;
		if (item) {
			itemGUID = item?.guid;
			itemName = item?.name;
			itemCurrencySymbol = item?.currency?.symbol;
			itemCurrencyIconURL = item?.currency?.iconURL;
			itemChainID = item?.chainID;
			itemExplorerURL = item?.explorerURL || '';
			itemRPCURLs = item?.rpcURLs?.map(v => v) || [];
		}
		elName?.focus();
	}

	function addEdit(): void {
		itemName = itemName?.trim();
		itemCurrencySymbol = itemCurrencySymbol?.trim();
		if (itemChainID !== undefined && itemChainID !== null) itemChainID = Number(itemChainID);
		itemCurrencyIconURL = itemCurrencyIconURL?.trim();
		itemExplorerURL = itemExplorerURL?.trim();
		if (!itemName) {
			error = 'Network name is required';
			elName?.focus();
			return;
		}
		if (!itemCurrencySymbol) {
			error = 'Currency symbol is required';
			elCurrencySymbol?.focus();
			return;
		}
		if (itemChainID === undefined || itemChainID === null) {
			error = 'Chain ID is required';
			elChainID?.focus();
			return;
		}
		if (itemChainID < 0 || !Number.isInteger(itemChainID)) {
			error = 'Chain ID must be a positive whole number';
			elChainID?.focus();
			return;
		}
		if (itemRPCURLs && itemRPCURLs.length > 0) {
			for (let i = 0; i < itemRPCURLs.length; i++) {
				if (!itemRPCURLs[i]?.trim()) {
					error = 'RPC URL ' + (i + 1) + ' is required';
					elRPCURLs[i]?.focus();
					return;
				}
			}
		}
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
	.modal-edit-network {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.row {
		display: flex;
		gap: 10px;
	}
</style>

<div class="modal-edit-network">
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
