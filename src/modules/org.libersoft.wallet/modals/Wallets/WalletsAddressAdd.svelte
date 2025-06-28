<script lang="ts">
	import { addAddress, addressIndexAlreadyExists, addressesMaxIndex, type IWallet } from '../../wallet.ts';
	import { module } from '../../module.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
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

	function keyDown(event: KeyboardEvent) {
		error = null;
		if (event.key === 'Enter') {
			event.preventDefault();
			clickAdd();
		}
	}

	function clickAdd() {
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

	function isPositiveInteger(value) {
		if (typeof value !== 'number' || !Number.isFinite(value)) return false;
		return Number.isInteger(value) && value > 0;
	}
</script>

<Label text="Name">
	<Input bind:value={name} onKeydown={keyDown} />
</Label>
<Label text="Index">
	<Input type="string" bind:value={index} onKeydown={keyDown} />
</Label>
{#if error}
	<Alert type="error" message={error} />
{/if}
<ButtonBar expand equalize>
	<Button img="modules/{module.identifier}/img/wallet-address-add.svg" text="Add" onClick={clickAdd} />
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
