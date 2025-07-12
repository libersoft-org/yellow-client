<script lang="ts">
	//import { onMount } from 'svelte';
	import { addressBook, type IAddressBookItem, addAddressBookItem, editAddressBookItem } from '../../scripts/wallet.ts';
	import { module } from '../../scripts/module.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	interface Props {
		params?: {
			item?: IAddressBookItem | null | undefined;
		};
		close?: () => void;
	}
	let { params, close }: Props = $props();
	let name: string | undefined = $state();
	let address: string | undefined = $state();
	let error: string | undefined = $state();
	let elName: Input;

	export function onOpen(item: IAddressBookItem) {
		if (item) {
			name = item.name || '';
			address = item.address || '';
		}
		if (elName) elName.focus();
	}

	function add(): void {
		const result = addAddressBookItem(name, address);
		if (!result.isValid) {
			error = result.error;
			return;
		}
		console.log('NEW ITEM IN ADDRESS BOOK:', name, address);
		if (close) close();
	}

	function edit(): void {
		if (!params?.item?.guid) return;
		const result = editAddressBookItem(params.item.guid, name, address);
		if (!result.isValid) {
			error = result.error;
			return;
		}
		if (close) close();
	}

	function handleSubmit(): void {
		error = '';
		if (params?.item) edit();
		else add();
	}

	function clearError(): void {
		if (error) error = '';
	}
</script>

<style>
	.addressbook-new {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="addressbook-new">
	<Form onSubmit={handleSubmit}>
		<Label text="Name">
			<Input placeholder="Name" bind:value={name} bind:this={elName} onChange={clearError} />
		</Label>
		<Label text="Address">
			<Input placeholder="Address" bind:value={address} onChange={clearError} />
		</Label>
		{#if error}
			<Alert type="error" message={error} />
		{/if}
	</Form>
	<ButtonBar expand>
		{#if params?.item}
			<Button img="img/save.svg" text="Save" onClick={edit} />
		{:else}
			<Button img="modules/{module.identifier}/img/address-add.svg" text="Add" onClick={add} />
		{/if}
		<Button img="img/cancel.svg" text="Cancel" onClick={close} />
	</ButtonBar>
</div>
