<script lang="ts">
	import { onMount } from 'svelte';
	import { Mnemonic } from 'ethers';
	import { addWallet, wallets } from 'libersoft-crypto/wallet';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import Form from '@/core/components/Form/Form.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();
	let error: string | null | undefined = $state();
	let name: string | undefined = $state();
	let phrase: string | undefined = $state();
	let elName: Input | undefined;
	let elPhrase: Input | undefined;
	let hidePhrase = $state(true);

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

<style>
	.row {
		display: flex;
		justify-items: center;
	}
</style>

<Form onSubmit={recover}>
	<Label text="Wallet name">
		<Input type="text" bind:value={name} bind:this={elName} />
	</Label>
	<Label text="Recovery phrase">
		<div class="row">
			<Input type={hidePhrase ? 'password' : 'text'} bind:value={phrase} bind:this={elPhrase} />
			<Icon img={hidePhrase ? 'img/show.svg' : 'img/hide.svg'} onClick={() => (hidePhrase = !hidePhrase)} />
		</div>
	</Label>
</Form>
{#if error}
	<Alert type="error" message={error} />
{/if}
<ButtonBar expand>
	<Button img="modules/{module.identifier}/img/recover.svg" text="Recover" onClick={recover} />
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
