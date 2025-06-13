<script>
	import { onMount } from 'svelte';
	import { isAddress } from 'ethers';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import { addressBook } from '../../wallet.ts';
	export let close;
	export let params;
	let aliasElement;
	let alias = '';
	let address = '';
	let error = '';

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

	.group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>

<div class="addressbook-new" data-testid="addressbook-add-edit-form">
	<div class="group">
		<div class="bold">Alias:</div>
		<Input placeholder="Alias" bind:value={alias} bind:this={aliasElement} onKeydown={keyEnter} onInput={clearError} data-testid="addressbook-alias-input" />
	</div>
	<div class="group">
		<div class="bold">Address:</div>
		<Input placeholder="Address" bind:value={address} onKeydown={keyEnter} onInput={clearError} data-testid="addressbook-address-input" />
	</div>
	{#if error}
		<Alert type="error" message={error} data-testid="addressbook-error-alert" />
	{/if}
	{#if params.item}
		<Button img="img/save.svg" text="Save" onClick={edit} data-testid="addressbook-save-btn" />
	{:else}
		<Button text="Add" onClick={add} data-testid="addressbook-add-btn" />
	{/if}
</div>
