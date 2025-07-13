<script lang="ts">
	import { addAddress, addressIndexAlreadyExists, addressesMaxIndex, type IWallet } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
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
	let error: string | undefined = $state();

	export function onOpen(): void {
		let max = addressesMaxIndex(wallet.addresses || []) + 1;
		index = wallet.addresses ? max : 0;
		name = 'Address ' + max;
	}

	function clickAdd(): void {
		error = undefined;
		let id: number | undefined;
		if (index) {
			id = Number(index);
			if (!isPositiveInteger(id)) {
				error = 'Index must be a positive whole number';
				return;
			}
			if (addressIndexAlreadyExists(wallet, id)) {
				error = 'Address with the specified index already exists';
				return;
			}
		}
		addAddress(wallet, id, name);
		close();
	}

	function isPositiveInteger(value: unknown): boolean {
		if (typeof value !== 'number' || !Number.isFinite(value)) return false;
		return Number.isInteger(value) && value > 0;
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
