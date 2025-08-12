<script lang="ts">
	import { editAddressName, type IWallet } from '@/org.libersoft.wallet/scripts/crypto-utils/wallet';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	interface Props {
		wallet: IWallet;
		index: string | number;
		close: () => void;
	}
	let { wallet, index, close }: Props = $props();
	let name: string | undefined = $state();
	let error: string | null | undefined = $state();
	let elName: Input | undefined;
	let initialized = $state(false);

	export function onOpen(): void {
		error = null;
		console.log('onOpen called - Settings address edit, wallet:', wallet, 'index:', index);
		console.log('Current wallet addresses:', wallet?.addresses);
		name = wallet?.addresses?.find(a => a.index === index)?.name || '';
		console.log('Found name for edit:', name);
		initialized = true;
		elName?.focus();
	}

	// Fallback initialization if onOpen is not called
	$effect(() => {
		if (!initialized) {
			console.log('Fallback initialization - Settings address edit');
			name = wallet?.addresses?.find(a => a.index === index)?.name || '';
			initialized = true;
		}
	});

	function clickEdit(): void {
		console.log('Click edit:', name, index);
		name = name?.trim();
		const validationConfig = [{ field: name, element: elName, required: 'Name is required' }];
		error = validateForm(validationConfig);
		if (error) return;
		console.log('Current wallet addresses:', wallet?.addresses);
		// TODO: check if index exists in wallet addresses

		if (!wallet) {
			error = 'Wallet not found';
			return;
		}
		if (index === undefined || index === null) {
			error = 'Address index is missing';
			return;
		}
		console.log('About to call editAddressName with:', wallet, index, name);
		editAddressName(wallet, index, name!);
		console.log('After editAddressName, wallet addresses:', wallet?.addresses);
		console.log('About to call close()');
		close();
		console.log('After close()');
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
