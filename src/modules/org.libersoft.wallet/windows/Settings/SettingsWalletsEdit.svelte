<script lang="ts">
	import { editWallet, type IWallet } from '../../scripts/wallet.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	let name: string | undefined = $state();
	let error: string | undefined = $state();
	interface Props {
		wallet: IWallet;
		close: () => void;
	}
	let { wallet, close }: Props = $props();

	$effect(() => {
		name = wallet?.name;
	});

	function handleSubmit(): void {
		error = undefined;
		clickEdit();
	}

	function clickEdit(): void {
		name = name?.trim();
		if (!name) {
			error = 'Name cannot be empty';
			return;
		}
		if (editWallet(wallet, name)) close();
		else error = 'Failed to edit wallet name';
	}
</script>

<Form onSubmit={handleSubmit}>
	<Label text="Name">
		<Input bind:value={name} />
	</Label>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
</Form>
<ButtonBar expand>
	<Button img="img/edit.svg" text="Edit" onClick={clickEdit} />
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
