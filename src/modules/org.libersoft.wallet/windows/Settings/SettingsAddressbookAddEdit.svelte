<script lang="ts">
	import { addAddressBookItem, editAddressBookItem, type IAddressBookItem } from '@/org.libersoft.wallet/scripts/crypto-utils/addressbook';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	interface Props {
		item?: IAddressBookItem;
		close: () => void;
	}
	let { item, close }: Props = $props();
	let name: string | undefined = $state();
	let address: string | undefined = $state();
	let error: string | null | undefined = $state();
	let elName: Input | undefined;
	let elAddress: Input | undefined;

	export function onOpen(): void {
		if (item) {
			name = item.name || '';
			address = item.address || '';
		} else {
			name = '';
			address = '';
		}
		error = null;
		setTimeout(() => elName?.focus(), 0);
	}

	function validateFields(): boolean {
		name = name?.trim();
		address = address?.trim();
		const validationConfig = [
			{ field: name, element: elName, required: 'Name is required' },
			{ field: address, element: elAddress, required: 'Address is required' },
		];
		error = validateForm(validationConfig);
		if (error) return false;
		// Update values after validation (trim was applied)
		name = validationConfig[0].field;
		address = validationConfig[1].field;
		return true;
	}

	function add(): void {
		if (!validateFields()) return;
		const result = addAddressBookItem(name, address);
		if (!result.isValid) {
			error = result.error;
			return;
		}
		console.log('NEW ITEM IN ADDRESS BOOK:', name, address);
		close();
	}

	function edit(): void {
		if (!item?.guid) return;
		if (!validateFields()) return;
		const result = editAddressBookItem(item.guid, name, address);
		if (!result.isValid) {
			error = result.error;
			return;
		}
		close();
	}

	function handleSubmit(): void {
		error = null;
		if (item) edit();
		else add();
	}

	function clearError(): void {
		if (error) error = null;
	}
</script>

<style>
	.addressbook-add-edit {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="addressbook-add-edit">
	<Form onSubmit={handleSubmit}>
		<Label text="Name">
			<Input placeholder="Name" bind:value={name} bind:this={elName} onChange={clearError} />
		</Label>
		<Label text="Address">
			<Input placeholder="Address" bind:value={address} bind:this={elAddress} onChange={clearError} />
		</Label>
		{#if error}
			<Alert type="error" message={error} />
		{/if}
	</Form>
	<ButtonBar expand>
		{#if item}
			<Button img="img/save.svg" text="Save" onClick={edit} />
		{:else}
			<Button img="modules/{module.identifier}/img/address-add.svg" text="Add" onClick={add} />
		{/if}
		<Button img="img/cancel.svg" text="Cancel" onClick={close} />
	</ButtonBar>
</div>
