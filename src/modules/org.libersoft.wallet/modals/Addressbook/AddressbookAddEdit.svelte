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
	let elName;

	onMount(() => {
		console.log(params.item);

		if (params.item) {
			name = params.item.name;
			address = params.item.address;
		}
		elName.focus();
	});

	function findAddressBookItemByAddress(address) {
		const ab = $addressBook;
		return ab.find(i => i.address === address);
	}

	function findAddressBookItemById(id) {
		const ab = $addressBook;
		return ab.find(i => i.guid === id);
	}

	function add() {
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
		let dupe = findAddressBookItemByAddress(address);
		if (dupe) {
			error = 'Address already exists in the address book, see name: "' + dupe.name + '"';
			return;
		}
		console.log('NEW ITEM IN ADDRESS BOOK:', name, address);
		$addressBook.push({ name, address });
		addressBook.set($addressBook);
		close();
	}

	function edit() {
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
		let dupe = findAddressBookItemByAddress(address);
		if (dupe && dupe.guid != params.item.guid) {
			error = 'Address already exists in the address book, see name: "' + dupe.name + '"';
			return;
		}
		params.item.name = name;
		params.item.address = address;
		addressBook.set($addressBook);
		close();
	}

	function keyEnter() {
		if (event.key === 'Enter') {
			event.preventDefault();
			add();
		}
	}

	function clearError() {
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
	<Label text="Name">
		<Input placeholder="Name" bind:value={name} bind:this={elName} onKeydown={keyEnter} onInput={clearError} />
	</Label>
	<Label text="Address">
		<Input placeholder="Address" bind:value={address} onKeydown={keyEnter} onInput={clearError} />
	</Label>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
	<ButtonBar expand>
		{#if params.item}
			<Button img="img/save.svg" text="Save" onClick={edit} />
		{:else}
			<Button img="modules/{module.identifier}/img/address-add.svg" text="Add" onClick={add} />
		{/if}
		<Button img="img/cancel.svg" text="Cancel" onClick={close} />
	</ButtonBar>
</div>
