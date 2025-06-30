<script lang="ts">
	import { networks, type INetwork } from '../../wallet.ts';
	import { module } from '../../module.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	interface Props {
		params: {
			item: INetwork;
		};
		close: () => void;
	}
	let { params, close }: Props = $props();
	let item_guid: string = '';
	let item_name: string = $state('');
	let item_currency_symbol: string = $state('');
	let item_currency_iconURL: string = $state('');
	let item_chain_id: number = $state(0);
	// Explorer URL is displayed but not stored in INetwork
	let item_explorer_url: string = $state('');
	let item_rpc_urls: string[] = $state([]);

	$effect(() => {
		update(params);
	});

	export function onOpen() {
		window.alert('onOpen');
	}

	function update(params: Props['params']): void {
		//console.log('update', params);
		if (item_guid) return;
		let item = params.item;
		if (item) {
			item_guid = item.guid;
			item_name = item.name;
			item_currency_symbol = item.currency.symbol;
			item_currency_iconURL = item.currency.iconURL;
			item_chain_id = item.chainID;
			item_explorer_url = item.explorerURL || '';
			item_rpc_urls = item.rpcURLs.map(v => v);
		}
	}

	function add() {
		let item: INetwork = {
			name: item_name,
			currency: {
				symbol: item_currency_symbol,
				iconURL: item_currency_iconURL,
			},
			chainID: item_chain_id,
			rpcURLs: item_rpc_urls,
		};
		$networks.push(item);
		networks.set($networks);
		close();
	}

	function edit(): void {
		let item = $networks.find(v => v.guid === params.item.guid);
		if (!item) {
			window.alert('Network not found');
			return;
		}
		item.name = item_name;
		item.currency.symbol = item_currency_symbol;
		item.currency.iconURL = item_currency_iconURL;
		item.chainID = item_chain_id;
		item.rpcURLs = item_rpc_urls;
		networks.update(v => v);
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
	<Form onSubmit={params?.item ? edit : add}>
		<Label text="Name">
			<Input bind:value={item_name} />
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
			{#each item_rpc_urls as rpc_url, i}
				<div class="row">
					<Input bind:value={item_rpc_urls[i]} />
					<Icon img="img/del.svg" alt="Remove RPC URL" onClick={() => (item_rpc_urls = item_rpc_urls.filter((v, j) => j !== i))} />
				</div>
			{/each}
		</Label>
		<Button img="img/add.svg" text="Add RPC URL" onClick={() => (item_rpc_urls = [...item_rpc_urls, ''])} />
	</Form>
	<ButtonBar expand>
		{#if params?.item}
			<Button img="img/save.svg" text="Save" onClick={edit} />
		{:else}
			<Button img="modules/{module.identifier}/img/network-add.svg" text="Add network" onClick={add} />
		{/if}
		<Button img="img/cancel.svg" text="Cancel" onClick={close} />
	</ButtonBar>
</div>
