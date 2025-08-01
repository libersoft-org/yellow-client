<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { trezorState, type TrezorAccount, staticSessionId, devicePath } from '@/org.libersoft.wallet/scripts/trezor';
	import { addHardwareWallet } from '@/org.libersoft.wallet/scripts/wallet';
	import TrezorConnect from '@/org.libersoft.wallet/components/TrezorConnect.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import TrezorDebug from '@/org.libersoft.wallet/components/TrezorDebug.svelte';

	const setSettingsSection = getContext<Function>('setSettingsSection');
	let walletName = '';
	let selectedAccount: TrezorAccount | null = null;
	let step: 'select-wallet' | 'configure' = 'select-wallet';
	let trezorConnect: TrezorConnect;

	function selectAccount(account: TrezorAccount) {
		selectedAccount = account;
		walletName = account.name || 'Trezor Wallet';
		step = 'configure';
	}

	async function addWallet() {
		await addHardwareWallet('trezor', walletName, { staticSessionId: $staticSessionId, path: $devicePath });
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
		max-width: 500px;
		margin: 0 auto;
		padding: 20px;
	}

	.accounts-list {
		margin: 20px 0;
	}

	.account-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border: 1px solid var(--primary-foreground);
		border-radius: 8px;
		margin: 10px 0;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.account-item:hover {
		background-color: var(--primary-background);
	}

	.account-item.selected {
		background-color: var(--primary-background);
		border-color: var(--accent-color);
	}

	.account-info {
		flex: 1;
	}

	.account-name {
		font-weight: bold;
		margin-bottom: 5px;
	}

	.account-address {
		font-size: 0.9em;
		color: var(--secondary-foreground);
		font-family: monospace;
	}

	.form-section {
		margin: 20px 0;
	}

	.buttons {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		margin-top: 30px;
	}
</style>

<div class="trezor-setup">
	<h2>Add Trezor Wallet</h2>

	<div class="buttons">
		step: {step}<br />
		<Button img="img/cancel.svg" text="Back" onClick={goBack} />
	</div>

	{#if step === 'select-wallet'}
		<TrezorConnect bind:this={trezorConnect} {onConnected} />
		<div class="buttons">
			<Button onClick={() => (step = 'configure')} enabled={!!$trezorState} text="Next" />
		</div>
	{:else if step === 'configure'}
		<h3>Configure Wallet</h3>
		<p>Give your Trezor wallet a name:</p>

		<div class="form-section">
			<Label text="Wallet Name">
				<Input bind:value={walletName} placeholder="Enter wallet name" />
			</Label>
		</div>

		<div>
			staticSessionId: {$staticSessionId}
		</div>
		<div>
			devicePath: {$devicePath}
		</div>

		<div class="buttons">
			<Button onClick={addWallet} enabled={!!walletName.trim()}>Add Wallet</Button>
		</div>
	{/if}
</div>
<TrezorDebug />
