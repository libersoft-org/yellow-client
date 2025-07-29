<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { resetTrezorState, trezorAccounts, trezorDevice, type TrezorAccount, loadAccounts } from '@/org.libersoft.wallet/scripts/trezor';
	import { addHardwareWallet } from '@/org.libersoft.wallet/scripts/wallet';
	import TrezorConnect from '@/org.libersoft.wallet/components/TrezorConnect.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

	const setSettingsSection = getContext<Function>('setSettingsSection');
	let walletName = '';
	let selectedAccount: TrezorAccount | null = null;
	let step: 'connect' | 'select-account' | 'configure' = 'connect';
	let trezorConnect: TrezorConnect;

	onMount(() => {
		if ($trezorDevice) {
			step = 'select-account';
		}
	});

	function selectAccount(account: TrezorAccount) {
		selectedAccount = account;
		walletName = account.name || 'Trezor Wallet';
		step = 'configure';
	}

	async function addWallet() {
		if (!selectedAccount) return;
		try {
			// Získat device ID z trezor device store
			let deviceId = 'trezor-device';
			if ($trezorDevice) deviceId = $trezorDevice.id;
			await addHardwareWallet('trezor', selectedAccount.address, walletName, deviceId, selectedAccount.path);
			// Přejít zpět na seznam wallets
			setSettingsSection('wallets');
		} catch (error) {
			console.error('Error adding Trezor wallet:', error);
		}
	}

	function goBack() {
		if (step === 'configure') step = 'select-account';
		else if (step === 'select-account') step = 'connect';
		else setSettingsSection('wallets-add');
	}

	function onConnected() {
		console.log('onConnected');
		if (step === 'connect') {
			step = 'select-account';
		}
	}
</script>

<style>
	.trezor-setup {
		max-width: 500px;
		margin: 0 auto;
		padding: 20px;
	}

	.status-card {
		display: flex;
		align-items: center;
		padding: 20px;
		border: 1px solid var(--primary-foreground);
		border-radius: 10px;
		margin: 20px 0;
		background-color: var(--primary-softer-background);
	}

	.status-card.connected {
		border-color: var(--success-color);
		background-color: var(--success-background);
	}

	.status-card.error {
		border-color: var(--error-color);
		background-color: var(--error-background);
	}

	.status-icon {
		margin-right: 15px;
	}

	.status-text {
		flex: 1;
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

	.loading {
		text-align: center;
		padding: 20px;
	}

	.error-message {
		color: var(--error-color);
		margin-top: 10px;
	}
</style>

<div class="trezor-setup">
	<h2>Add Trezor Wallet</h2>

	<div class="buttons">
		step: {step}
		<Button img="img/cancel.svg" text="Back" onClick={goBack} />
		<Button onClick={resetTrezorState}>resetTrezorState</Button>
	</div>

	{#if step === 'connect'}
		<TrezorConnect bind:this={trezorConnect} {onConnected} />
	{:else if step === 'select-account'}
		<h3>Select Account</h3>
		<p>Choose which account you want to add to your wallet:</p>

		{#if $trezorAccounts?.length > 0}
			<div class="accounts-list">
				{#each $trezorAccounts as account, index}
					<div class="account-item" class:selected={selectedAccount?.address === account.address} on:click={() => selectAccount(account)} role="button" tabindex="0" on:keydown={e => e.key === 'Enter' && selectAccount(account)}>
						<div class="account-info">
							<div class="account-name">{account.name}</div>
							<div class="account-address">{account.address}</div>
						</div>
						<Icon img="img/caret-right.svg" size="20px" />
					</div>
				{/each}
			</div>
		{:else}
			<Button onClick={loadAccounts} text="Load Accounts" />
		{/if}

		<div class="buttons">
			<Button onClick={() => (step = 'configure')} enabled={!!selectedAccount}>Continue</Button>
		</div>
	{:else if step === 'configure'}
		<h3>Configure Wallet</h3>
		<p>Give your Trezor wallet a name:</p>

		<div class="form-section">
			<Label text="Wallet Name">
				<Input bind:value={walletName} placeholder="Enter wallet name" />
			</Label>
		</div>

		{#if selectedAccount}
			<div class="status-card">
				<div class="status-text">
					<div class="bold">Selected Account:</div>
					<div class="account-address">{selectedAccount.address}</div>
				</div>
			</div>
		{/if}

		<div class="buttons">
			<Button onClick={addWallet} enabled={!!walletName.trim()}>Add Wallet</Button>
		</div>
	{/if}
</div>
