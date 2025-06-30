<script lang="ts">
	import { Mnemonic } from 'ethers';
	import { addWallet } from '../../wallet.ts';
	import { module } from '../../module.ts';
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
	let error: string | undefined = $state();
	let name: string | undefined = $state();
	let phrase: string | undefined = $state();

	function recover() {
		phrase = phrase?.trim();
		if (!phrase) {
			error = 'Recovery phrase cannot be empty.';
			return;
		}
		let mnemonic: Mnemonic | undefined;
		try {
			mnemonic = Mnemonic.fromPhrase(phrase);
		} catch (e) {
			error = 'Invalid recovery phrase.';
			return;
		}
		addWallet(mnemonic, name);
		close();
	}
</script>

<Form onSubmit={recover}>
	<Label text="Wallet name">
		<Input type="text" bind:value={name} />
	</Label>
	<Label text="Recovery phrase">
		<Input type="text" bind:value={phrase} />
	</Label>
</Form>
{#if error}
	<Alert type="error" message={error} />
{/if}
<ButtonBar equalize expand>
	<Button img="modules/{module.identifier}/img/recover.svg" text="Recover" onClick={recover} />
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
