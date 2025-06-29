<script lang="ts">
	import { onMount } from 'svelte';
	import { isAddress } from 'ethers';
	import { addressBook, type IAddressBookItem } from '../../wallet.ts';
	import { module } from '../../module.ts';
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

	onMount(() => {
		//console.log(params?.item);
		if (params?.item) {
			name = params.item.name || '';
			address = params.item.address || '';
		}
		if (elName) elName.focus();
	});

	function findAddressBookItemByAddress(address: string): IAddressBookItem | undefined {
		const ab = $addressBook;
		return ab.find(i => i.address === address);
	}

	function findAddressBookItemById(id: string): IAddressBookItem | undefined {
		const ab = $addressBook;
		return ab.find(i => i.guid === id);
	}

	function add(): void {
		if (name) name = name.trim();
		if (address) address = address.trim();
		console.log(name, address);
		if (!address || address === '') {
			error = 'Address is not set';
			return;
		}
		if (!isAddress(address)) {
			error = 'Invalid Ethereum address format';
			return;
		}
		const dupe = findAddressBookItemByAddress(address);
		if (dupe) {
			error = 'Address already exists in the address book, see name: "' + (dupe.name || 'Unknown') + '"';
			return;
		}
		console.log('NEW ITEM IN ADDRESS BOOK:', name, address);
		$addressBook.push({ name: name || '', address });
		addressBook.set($addressBook);
		if (close) close();
	}

	function edit(): void {
		//console.log('EDIT ITEM IN ADDRESS BOOK:', name, address);
		if (name) name = name.trim();
		if (address) address = address.trim();
		if (!address || address === '') {
			error = 'Address is not set';
			return;
		}
		if (!isAddress(address)) {
			error = 'Invalid Ethereum address format';
			return;
		}
		const dupe = findAddressBookItemByAddress(address);
		if (dupe && params && params.item && dupe.guid !== params.item.guid) {
			error = 'Address already exists in the address book, see name: "' + (dupe.name || 'Unknown') + '"';
			return;
		}
		if (params && params.item) {
			// Správně - vytvořit nový array s aktualizovaným objektem
			addressBook.update(currentItems => currentItems.map(item => (item.guid === params.item.guid ? { ...item, name: name || '', address: address } : item)));
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
			<Input placeholder="Name" bind:value={name} bind:this={elName} onInput={clearError} />
		</Label>
		<Label text="Address">
			<Input placeholder="Address" bind:value={address} onInput={clearError} />
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
