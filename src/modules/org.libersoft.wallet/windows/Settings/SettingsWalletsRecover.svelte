<script lang="ts">
	import { onMount } from 'svelte';
	import { Mnemonic } from 'ethers';
	import { addWallet, wallets } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import Form from '@/core/components/Form/Form.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	interface Props {
		close: () => void;
	}
	let { close }: Props = $props();
	let error: string | null | undefined = $state();
	let name: string | undefined = $state();
	let phrase: string | undefined = $state();
	let elName: Input | undefined;
	let elPhrase: Input | undefined;

	onMount(() => {
		name = 'My wallet ' + ($wallets.length + 1);
	});

	function recover() {
		name = name?.trim();
		phrase = phrase?.trim();
		const validationConfig = [
			{ field: name, element: elName, required: 'Wallet name is required' },
			{ field: phrase, element: elPhrase, required: 'Recovery phrase is required' },
		];
		error = validateForm(validationConfig);
		if (error) return;
		let mnemonic: Mnemonic | undefined;
		try {
			mnemonic = Mnemonic.fromPhrase(phrase!);
		} catch (e) {
			error = 'Invalid recovery phrase.';
			elPhrase?.focus();
			return;
		}
		addWallet(mnemonic, name!);
		close();
	}
</script>

<Form onSubmit={recover}>
	<Label text="Wallet name">
		<Input type="text" bind:value={name} bind:this={elName} />
	</Label>
	<Label text="Recovery phrase">
		<Input type="text" bind:value={phrase} bind:this={elPhrase} />
	</Label>
</Form>
{#if error}
	<Alert type="error" message={error} />
{/if}
<ButtonBar expand>
	<Button img="modules/{module.identifier}/img/recover.svg" text="Recover" onClick={recover} />
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
