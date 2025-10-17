<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { getContext } from 'svelte';
	import { trezorState, staticSessionId } from 'libersoft-crypto/trezor';
	import { addHardwareWallet, type IWallet } from 'libersoft-crypto/wallet';
	import TrezorConnect from '@/org.libersoft.wallet/components/TrezorConnect.svelte';
	import FormAddressAdd from '@/org.libersoft.wallet/components/FormAddressAdd.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import TrezorDebug from '@/org.libersoft.wallet/components/TrezorDebug.svelte';

	const setSettingsSection = getContext<Function>('setSettingsSection');
	let walletName = $state('');
	let createdWallet = $state<IWallet | null>(null);
	let step: 'select-wallet' | 'configure' | 'add-address' | 'finish' = $state('select-wallet');
	let formAddressAdd = $state<FormAddressAdd>();

	let buttonNextTitle = $derived(step === 'select-wallet' ? 'Next' : step === 'configure' ? 'Add Wallet' : step === 'add-address' ? 'Add First Address' : 'Finish');
	let buttonNextEnabled = $derived(step === 'select-wallet' ? !!$trezorState : step === 'configure' ? !!walletName.trim() : true);

	async function buttonNextClick() {
		if (step === 'select-wallet') {
			step = 'configure';
		} else if (step === 'configure') {
			await addWallet();
			step = 'add-address';
		} else if (step === 'add-address') {
			await addFirstAddress();
		} else if (step === 'finish') {
			setSettingsSection('wallets');
		}
	}

	async function addWallet() {
		console.log('addWallet...');
		createdWallet = await addHardwareWallet('trezor', walletName, { staticSessionId: $staticSessionId });
	}

	async function addFirstAddress() {
		if (formAddressAdd) {
			await formAddressAdd.clickAdd();
		}
	}

	function onAddressSuccess() {
		step = 'finish';
	}

	// Initialize the form when entering the add-address step
	$effect(() => {
		if (step === 'add-address' && formAddressAdd) {
			formAddressAdd.onOpen();
		}
	});

	function goBack() {
		if (step === 'finish') {
			step = 'add-address';
		} else if (step === 'add-address') {
			step = 'configure';
		} else if (step === 'configure') {
			step = 'select-wallet';
		} else {
			setSettingsSection('wallets-add');
		}
	}

	function onConnected() {
		console.log('onConnected');
	}
</script>

<style>
	.trezor-setup {
		max-width: 800px;
		/*margin: 0 auto;
		padding: 20px;*/
	}

	.form-section {
		margin: 20px 0;
	}

	.buttons {
		display: flex;
		flex-direction: row;
		gap: 10px;
		justify-content: flex-end;
		margin-top: 30px;
	}
</style>

<div class="trezor-setup">
	<h2>Add Trezor Wallet</h2>

	{#if $debug}
		step: {step}<br />
	{/if}

	{#if step === 'select-wallet'}
		<TrezorConnect {onConnected} />
	{:else if step === 'configure'}
		<h3>Configure Wallet</h3>
		<p>Give your Trezor wallet a name:</p>

		<div class="form-section">
			<Label text="Wallet Name">
				<Input bind:value={walletName} placeholder="Enter wallet name" />
			</Label>
		</div>
	{:else if step === 'add-address'}
		<h3>Add First Address</h3>
		<p>Create your first address for this wallet:</p>

		{#if createdWallet}
			<FormAddressAdd bind:this={formAddressAdd} wallet={createdWallet} onSuccess={onAddressSuccess} />
		{/if}
	{:else if step === 'finish'}
		<h3>Setup Complete!</h3>
		<p>Your Trezor wallet has been successfully created with your first address.</p>
		<p>You can now start receiving and sending transactions with your hardware wallet.</p>
	{/if}
	<div class="buttons">
		<Button img="img/cancel.svg" text="Back" onClick={goBack} enabled={step !== 'select-wallet'} />
		<Button onClick={buttonNextClick} enabled={buttonNextEnabled}>{buttonNextTitle}</Button>
	</div>
</div>
<TrezorDebug />
