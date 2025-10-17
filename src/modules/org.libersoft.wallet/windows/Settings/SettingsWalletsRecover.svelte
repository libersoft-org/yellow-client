<script lang="ts">
	import { onMount } from 'svelte';
	import { Mnemonic } from 'ethers';
	import { addWallet, wallets } from 'libersoft-crypto/wallet';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Import from '@/core/components/Import/Import.svelte';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();
	let error: string | null | undefined = $state();
	let name: string | undefined = $state();
	let elName: Input | undefined;

	onMount(() => {
		name = 'My wallet ' + ($wallets.length + 1);
	});

	function validateRecoveryPhrase(text: string): { valid: boolean; error?: string } {
		const trimmedText = text.trim();
		if (!trimmedText) {
			return { valid: false, error: 'Recovery phrase is required' };
		}
		try {
			Mnemonic.fromPhrase(trimmedText);
			return { valid: true };
		} catch (e) {
			return { valid: false, error: 'Invalid recovery phrase format' };
		}
	}

	async function handleImportRecoveryPhrase(phrase: string): Promise<void> {
		name = name?.trim();
		const validationConfig = [{ field: name, element: elName, required: 'Wallet name is required' }];
		error = validateForm(validationConfig);
		if (error) throw new Error(error);

		const mnemonic = Mnemonic.fromPhrase(phrase.trim());
		addWallet(mnemonic, name!);
		close();
	}
</script>

<Label text="Wallet name">
	<Input type="text" bind:value={name} bind:this={elName} />
</Label>

<Import onValidate={validateRecoveryPhrase} onAdd={handleImportRecoveryPhrase} testId="wallet-recovery" jsonLabel="Text" qrLabel="QR Code" addButtonText="Recover Wallet" fileAccept=".txt,.json" browseButtonText="Load from file" qrInstructions="Scan QR code containing recovery phrase" />
{#if error}
	<Alert type="error" message={error} />
{/if}
<ButtonBar expand>
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
