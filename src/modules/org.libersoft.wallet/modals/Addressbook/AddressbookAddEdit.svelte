<script lang="ts">
	import { onMount } from 'svelte';
	import { isAddress } from 'ethers';
	import Label from '@/core/components/Label/Label.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import { addressBook } from '../../wallet.ts';
	import { module } from '../../module.ts';
	interface Props {
		close: () => void;
		params: {
			item?: {
				guid: string;
				alias: string;
				address: string;
			};
		};
	}
	let { close, params }: Props = $props();
	let aliasElement;
	let alias = $state('');
	let address = $state('');
	let error = $state('');

	onMount(() => {
		if (params.item) {
			alias = params.item.alias;
			address = params.item.address;
		}
		aliasElement.focus();
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
		if (alias) alias = alias.trim();
		if (address) address = address.trim();
		console.log(alias, address);
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
			error = 'Address already exists in the address book, see alias: "' + dupe.alias + '"';
			return;
		}
		console.log('NEW ITEM IN ADDRESS BOOK:', alias, address);
		$addressBook.push({ alias, address });
		addressBook.set($addressBook);
		close();
	}

	function edit() {
		if (alias) alias = alias.trim();
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
			error = 'Address already exists in the address book, see alias: "' + dupe.alias + '"';
			return;
		}
		params.item.alias = alias;
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
	<Label text="Alias">
		<Input placeholder="Alias" bind:value={alias} bind:this={aliasElement} onKeydown={keyEnter} onInput={clearError} />
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
