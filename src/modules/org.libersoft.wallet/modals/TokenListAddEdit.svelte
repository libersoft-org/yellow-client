<script>
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import { getGuid } from '@/core/core.ts';
	import { onMount } from 'svelte';
	export let close;
	export let params;

	let item_guid = '';
	let item_name = '';
	let item_icon = '';
	let item_symbol = '';
	let item_contract_address = '';

	onMount(() => {
		let item = params.item;
		if (item) {
			item_guid = item.guid;
			item_name = item.name;
			item_icon = item.icon;
			item_symbol = item.symbol;
			item_contract_address = item.contract_address;
		}
	});

	function token() {
		return {
			guid: item_guid || getGuid(),
			name: item_name,
			icon: item_icon,
			symbol: item_symbol,
			contract_address: item_contract_address,
		};
	}

	function clickAdd() {
		params.onAdd(token());
		close();
	}

	function clickEdit() {
		params.onEdit(token());
		close();
	}
</script>

<style>
	.group {
		display: flex;
		flex-direction: column;
	}

	.group .label {
		font-weight: bold;
		margin-left: 5px;
	}
</style>

<div class="group">
	<div class="label">Name:</div>
	<Input bind:value={item_name} />
</div>
<div class="group">
	<div class="label">Icon:</div>
	<Input bind:value={item_icon} />
</div>
<div class="group">
	<div class="label">Symbol:</div>
	<Input bind:value={item_symbol} />
</div>
<div class="group">
	<div class="label">Contract address:</div>
	<Input bind:value={item_contract_address} />
</div>

{#if params.item}
	<Button img="img/save.svg" text="Save" onClick={clickEdit} />
{:else}
	<Button text="Add token" onClick={clickAdd} />
{/if}
