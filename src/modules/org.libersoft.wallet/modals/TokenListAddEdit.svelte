<script>
	import { onMount } from 'svelte';
	import { getGuid } from '@/core/core.ts';
	import { module } from '../module.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
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

<Label text="Name">
	<Input bind:value={item_name} />
</Label>
<Label text="Icon">
	<Input bind:value={item_icon} />
</Label>
<Label text="Symbol">
	<Input bind:value={item_symbol} />
</Label>
<Label text="Contract address">
	<Input bind:value={item_contract_address} />
</Label>
<ButtonBar equalize>
	{#if params.item}
		<Button img="img/save.svg" text="Save" onClick={clickEdit} />
	{:else}
		<Button img="modules/{module.identifier}/img/token-add.svg" text="Add token" onClick={clickAdd} />
	{/if}
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
