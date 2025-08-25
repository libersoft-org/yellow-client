<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { getContext } from 'svelte';
	import { trezorState, staticSessionId } from 'libersoft-crypto/trezor';
	import { addHardwareWallet } from 'libersoft-crypto/wallet';
	import TrezorConnect from '@/org.libersoft.wallet/components/TrezorConnect.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import TrezorDebug from '@/org.libersoft.wallet/components/TrezorDebug.svelte';

	const setSettingsSection = getContext<Function>('setSettingsSection');
	let walletName = '';
	let step: 'select-wallet' | 'configure' = 'select-wallet';

	async function addWallet() {
		await addHardwareWallet('trezor', walletName, { staticSessionId: $staticSessionId });
		setSettingsSection('wallets');
	}

	function goBack() {
		if (step === 'configure') step = 'select-wallet';
		else setSettingsSection('wallets-add');
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

		<div class="buttons">
			<Button onClick={addWallet} enabled={!!walletName.trim()}>Add Wallet</Button>
		</div>
	{/if}
	<div class="buttons">
		<Button img="img/cancel.svg" text="Back" onClick={goBack} enabled={step === 'configure'} />
		<Button onClick={() => (step = 'configure')} enabled={!!$trezorState} text="Next" />
	</div>
</div>
<TrezorDebug />
