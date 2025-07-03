<script lang="ts">
	import { networks, type INetwork } from '../../wallet.ts';
	import { module } from '../../module.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	let elName: Input | undefined;
	interface Props {
		params?: {
			network?: INetwork;
		};
		close: () => void;
	}
	let { params, close }: Props = $props();
	let item_guid: string | undefined;
	let item_name: string | undefined = $state();
	let item_currency_symbol: string | undefined = $state();
	let item_currency_iconURL: string | undefined = $state();
	let item_chain_id: number | undefined = $state();
	let item_explorer_url: string | undefined = $state();
	let item_rpc_urls: string[] | undefined = $state();
	let error: string | null | undefined = $state();

	export function onOpen(): void {
		console.log('onOpen - params', params);
		if (item_guid) return;
		let item: INetwork | null | undefined = params?.network;
		if (item) {
			item_guid = item?.guid;
			item_name = item?.name;
			item_currency_symbol = item?.currency?.symbol;
			item_currency_iconURL = item?.currency?.iconURL;
			item_chain_id = item?.chainID;
			item_explorer_url = item?.explorerURL || '';
			item_rpc_urls = item?.rpcURLs?.map(v => v) || [];
		}
		elName?.focus();
	}

	function addEdit(): void {
		const newItem: INetwork = {
			name: item_name || '',
			currency: {
				symbol: item_currency_symbol || '',
				iconURL: item_currency_iconURL,
			},
			chainID: item_chain_id || 0,
			rpcURLs: item_rpc_urls,
			explorerURL: item_explorer_url,
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
			<Input bind:value={item_name} bind:this={elName} />
		</Label>
		<Label text="Currency symbol">
			<Input bind:value={item_currency_symbol} />
		</Label>
		<Label text="Icon URL">
			<Input bind:value={item_currency_iconURL} />
		</Label>
		<Label text="Chain ID">
			<Input type="number" bind:value={item_chain_id} />
		</Label>
		<Label text="Explorer URL">
			<Input bind:value={item_explorer_url} />
		</Label>
		<Label text="RPC URLs">
			{#if item_rpc_urls}
				{#each item_rpc_urls as rpc_url, i}
					<div class="row">
						<Input bind:value={item_rpc_urls[i]} />
						<Icon img="img/del.svg" alt="Remove RPC URL" onClick={() => (item_rpc_urls = item_rpc_urls?.filter((v, j) => j !== i))} />
					</div>
				{/each}
			{/if}
		</Label>
		<Button img="img/add.svg" text="Add RPC URL" onClick={() => (item_rpc_urls = [...(item_rpc_urls || []), ''])} />
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
