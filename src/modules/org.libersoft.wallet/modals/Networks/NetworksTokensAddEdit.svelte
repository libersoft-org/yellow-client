<script lang="ts">
	import { onMount } from 'svelte';
	import { getGuid } from '@/core/scripts/core.ts';
	import { module } from '../../scripts/module.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	interface Props {
		close: () => void;
		params: {
			item?: {
				guid: string;
				name: string;
				icon: string;
				symbol: string;
				contract_address: string;
			};
			onAdd?: (item: any) => void;
			onEdit?: (item: any) => void;
		};
	}
	let { close, params }: Props = $props();
	let item_guid = $state('');
	let item_name = $state('');
	let item_icon = $state('');
	let item_symbol = $state('');
	let item_contract_address = $state('');

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
		if (params.onAdd) {
			params.onAdd(token());
		}
		close();
	}

	function clickEdit() {
		if (params.onEdit) {
			params.onEdit(token());
		}
		close();
	}

	function handleSubmit(): void {
		params.item ? clickEdit() : clickAdd();
	}
</script>

<Form onSubmit={handleSubmit}>
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
</Form>
<ButtonBar expand>
	{#if params.item}
		<Button img="img/save.svg" text="Save" onClick={clickEdit} />
	{:else}
		<Button img="modules/{module.identifier}/img/token-add.svg" text="Add token" onClick={clickAdd} />
	{/if}
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
