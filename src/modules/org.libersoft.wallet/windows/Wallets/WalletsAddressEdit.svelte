<script lang="ts">
	import { editAddressName, type IWallet } from '../../scripts/wallet.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	let wallet: IWallet | undefined = $state();
	let name: string | undefined = $state();
	let index: string | number | undefined = $state();
	let error: string | undefined = $state();
	interface Props {
		close: () => void;
	}
	let { close }: Props = $props();
	let elName: Input | undefined;

	/*
 export function open(_wallet: IWallet, _index: string | number) {
  console.log('open WalletsAddressEdit, wallet:', _wallet, 'index:', _index);
		wallet = _wallet;
		index = _index;
 }
		*/

	export function onOpen(_wallet: IWallet, _index: string | number): void {
		error = undefined;
		console.log('onOpen WalletsAddressEdit, wallet:', _wallet, 'index:', _index);
		wallet = _wallet;
		index = _index;
		name = wallet?.addresses?.find(a => a.index === index)?.name || '';
		elName?.focus();
	}

	function clickEdit(): void {
		console.log('Click edit:', name, index);
		// TODO - check if index exists in wallet addresses
		name = name?.trim();
		if (!name) {
			error = 'Name cannot be empty';
			return;
		}
		const validatedName = name;
		if (!wallet) {
			error = 'Wallet not found';
			return;
		}
		if (index === undefined || index === null) {
			error = 'Address index is missing';
			return;
		}
		editAddressName(wallet, index, validatedName);
		close();
	}
</script>

<Form onSubmit={clickEdit}>
	<Label text="Name">
		<Input bind:value={name} bind:this={elName} />
	</Label>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
</Form>
<ButtonBar expand>
	<Button img="img/save.svg" text="Save" onClick={clickEdit} />
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
