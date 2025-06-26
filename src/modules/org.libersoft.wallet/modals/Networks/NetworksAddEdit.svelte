<script>
	import { networks } from '../../wallet.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	export let close;
	export let params;
	let item_guid = '';
	let item_name = '';
	let item_currency_symbol = '';
	let item_currency_iconURL = '';
	let item_chain_id = '';
	let item_explorer_url = '';
	let item_rpc_urls = [];

	$: update(params);

	function update(params) {
		//console.log('update', params);
		if (item_guid) return;
		let item = params.item;
		if (item) {
			item_name = item.name;
			item_currency_symbol = item.currency.symbol;
			item_currency_iconURL = item.currency.iconURL;
			item_chain_id = item.chainID;
			item_explorer_url = item.explorerURL;
			item_rpc_urls = item.rpcURLs.map(v => v);
		}
	}

	function save() {
		let item = $networks.find(v => v.guid === params.item.guid);
		if (!item) {
			window.alert('Network not found');
			return;
		}
		item.name = item_name;
		item.currency.symbol = item_currency_symbol;
		item.currency.iconURL = item_currency_iconURL;
		item.chainId = item_chain_id;
		item.explorerURL = item_explorer_url;
		item.rpcURLs = item_rpc_urls;
		networks.update(v => v);
		close();
	}

	function saveAndClose() {
		save();
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
		<Input bind:value={item_chain_id} />
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
	<ButtonBar expand>
		<Button img="img/save.svg" text="Save" onClick={saveAndClose} />
		<Button img="img/cancel.svg" text="Cancel" onClick={close} />
	</ButtonBar>
</div>
