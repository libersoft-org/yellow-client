<script lang="ts">
	import { addAddress, addressIndexAlreadyExists, addressesMaxIndex, type IWallet } from '@/org.libersoft.wallet/scripts/crypto-utils/wallet';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	interface Props {
		wallet: IWallet;
		close: () => void;
	}
	let { wallet, close }: Props = $props();
	let name: string | undefined = $state();
	let index: number | undefined = $state();
	let error: string | null | undefined = $state();
	let elName: Input | undefined;
	let elIndex: Input | undefined;

	export function onOpen(): void {
		let max = addressesMaxIndex(wallet.addresses || []) + 1;
		index = wallet.addresses ? max : 0;
		name = 'Address ' + max;
		error = null;
	}

	async function clickAdd(): Promise<void> {
		error = null;
		let id: number | undefined;
		name = name?.trim();
		if (index !== undefined && index !== null) id = Number(index);
		const validationConfig = [
			{ field: name, element: elName, required: 'Name is required' },
			{ field: index, element: elIndex, validate: (v: number) => (v >= 0 && Number.isInteger(v) ? null : 'Index must be a non-negative whole number') },
		];
		error = validateForm(validationConfig);
		if (error) return;
		if (addressIndexAlreadyExists(wallet, id!)) {
			error = 'Address with the specified index already exists';
			elIndex?.focus();
			return;
		}
		await addAddress(wallet, id!, name!);
		close();
	}
</script>

<Form onSubmit={clickAdd}>
	<Label text="Name">
		<Input bind:value={name} />
	</Label>
	<Label text="Index">
		<Input type="number" bind:value={index} />
	</Label>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
</Form>
<ButtonBar expand>
	<Button img="modules/{module.identifier}/img/wallet-address-add.svg" text="Add" onClick={clickAdd} />
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
