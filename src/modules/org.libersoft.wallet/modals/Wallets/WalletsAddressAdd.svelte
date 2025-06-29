<script lang="ts">
	import { addAddress, addressIndexAlreadyExists, addressesMaxIndex, type IWallet } from '../../wallet.ts';
	import { module } from '../../module.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	let name: string | undefined = $state();
	let index: number | undefined = $state();
	let error: string | undefined = $state();
	interface Props {
		params: {
			wallet: IWallet;
		};
		close: () => void;
	}
	let { params, close }: Props = $props();

	$effect(() => {
		console.log('[EFFECT] Initializing address add modal with wallet:', params.wallet);
		let max = addressesMaxIndex(params.wallet.addresses) + 1;
		index = params.wallet.addresses ? max : 0;
		name = 'Address ' + max;
	});

	function handleSubmit(): void {
		error = undefined;
		clickAdd();
	}

	function clickAdd(): void {
		console.log('[ACTION] Add address:', name, index);
		let id: number | undefined;
		if (index) {
			id = Number(index);
			if (!isPositiveInteger(id)) {
				error = 'Index must be a positive whole number';
				return;
			}
			if (addressIndexAlreadyExists(params.wallet, id)) {
				error = 'Address with the specified index already exists';
				return;
			}
		}
		addAddress(params.wallet, id, name);
		close();
	}

	function isPositiveInteger(value: unknown): boolean {
		if (typeof value !== 'number' || !Number.isFinite(value)) return false;
		return Number.isInteger(value) && value > 0;
	}
</script>

<Form onSubmit={handleSubmit}>
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
<ButtonBar expand equalize>
	<Button img="modules/{module.identifier}/img/wallet-address-add.svg" text="Add" onClick={clickAdd} />
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
