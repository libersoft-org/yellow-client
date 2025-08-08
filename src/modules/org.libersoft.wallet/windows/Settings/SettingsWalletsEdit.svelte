<script lang="ts">
	import { editWallet, type IWallet } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	let name: string | undefined = $state();
	let error: string | null | undefined = $state();
	let elName: Input | undefined;
	interface Props {
		wallet: IWallet;
		close: () => void;
	}
	let { wallet, close }: Props = $props();

	$effect(() => {
		name = wallet?.name;
	});

	function handleSubmit(): void {
		error = null;
		clickEdit();
	}

	function clickEdit(): void {
		name = name?.trim();
		const validationConfig = [{ field: name, element: elName, required: 'Name is required' }];
		error = validateForm(validationConfig);
		if (error) return;
		if (name && editWallet(wallet, name)) close();
		else error = 'Failed to edit wallet name';
	}
</script>

<Form onSubmit={handleSubmit}>
	<Label text="Name">
		<Input bind:value={name} bind:this={elName} />
	</Label>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
</Form>
<ButtonBar expand>
	<Button img="img/edit.svg" text="Edit" onClick={clickEdit} />
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
