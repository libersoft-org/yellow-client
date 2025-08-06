<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { getContext, onMount } from 'svelte';
	import { addHardwareWallet } from '@/org.libersoft.wallet/scripts/wallet';
	import { initWalletLedger, addLedgerWalletToSystem, isLedgerConnected, getLedgerStatus } from '@/org.libersoft.wallet/scripts/ledger-integration';
	import { connectLedger, getLedgerEthereumAccounts, checkWebHIDSupport, ledgerLoading, ledgerDevice, getLedgerDeviceIdentifiers, type LedgerAccount } from '@/org.libersoft.wallet/scripts/ledger';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';

	const setSettingsSection = getContext<Function>('setSettingsSection');

	let walletName = $state('');
	let firstAccount = $state<LedgerAccount | null>(null);
	let step = $state<'connect' | 'configure'>('connect');
	let connectionError = $state('');

	onMount(async () => {
		// Check WebHID support before initializing
		const supportCheck = checkWebHIDSupport();
		if (!supportCheck.supported) {
			connectionError = supportCheck.error || 'WebHID not supported';
			return;
		}

		await initWalletLedger();
	});

	async function connectToLedger() {
		connectionError = '';
		const connected = await connectLedger();
		if (connected) {
			step = 'configure';
			await loadFirstAccount();
		} else {
			connectionError = 'Failed to connect to Ledger device. Please ensure your device is connected and unlocked.';
		}
	}

	async function loadFirstAccount() {
		// Load just the first account for informative display
		const accounts = await getLedgerEthereumAccounts(0, 1);
		if (accounts.length > 0) {
			firstAccount = accounts[0];
			walletName = 'Ledger Wallet';
		} else {
			connectionError = 'No accounts found on Ledger device.';
		}
	}

	async function addWallet() {
		// Get device identifiers similar to how Trezor uses staticSessionId
		const deviceIdentifiers = getLedgerDeviceIdentifiers();
		if (!deviceIdentifiers) {
			connectionError = 'No device connected.';
			return;
		}

		try {
			// Add hardware wallet representing the whole device, not a specific address
			await addHardwareWallet('ledger', walletName, deviceIdentifiers);
			setSettingsSection('wallets');
		} catch (error) {
			console.error('Error adding Ledger wallet:', error);
			connectionError = 'Failed to add wallet. Please try again.';
		}
	}

	function goBack() {
		if (step === 'configure') {
			step = 'connect';
		} else {
			setSettingsSection('wallets-add');
		}
	}

	function retry() {
		connectionError = '';
		connectToLedger();
	}

	function handleTryAgain() {
		connectionError = '';
		connectToLedger();
	}
</script>

<style>
	.ledger-setup {
		max-width: 800px;
	}

	.connection-status {
		padding: 20px;
		border-radius: 10px;
		margin: 20px 0;
		text-align: center;
	}

	.connection-instructions {
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}

	.account-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 20px 0;
	}

	.account-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border: 1px solid #000;
		border-radius: 10px;
		background-color: var(--primary-softer-background);
	}

	.account-info {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.account-name {
		font-weight: bold;
	}

	.account-address {
		font-family: monospace;
		font-size: 0.9em;
	}

	.account-public-key {
		font-family: monospace;
		font-size: 0.8em;
		text-overflow: ellipsis;
		overflow: hidden;
		max-width: 400px;
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
		display: flex;
		align-items: center;
		gap: 10px;
		justify-content: center;
		padding: 20px;
	}
</style>

<div class="ledger-setup">
	<h2>Add Ledger Wallet</h2>

	{#if connectionError}
		<Alert type="error">
			<div style="white-space: pre-line;">{connectionError}</div>
		</Alert>
	{/if}

	{#if step === 'connect'}
		<div class="connection-status connection-instructions">
			<h3>Connect Your Ledger Device</h3>
			<p><strong>Before clicking Connect:</strong></p>
			<p>1. Connect your Ledger device to your computer via USB</p>
			<p>2. Unlock your device by entering your PIN</p>
			<p>3. <strong style="color: var(--accent-color);">Navigate to and OPEN the Ethereum app</strong> on your Ledger device</p>
			<p>4. Wait for "Application is ready" message on your Ledger screen</p>
			<p>5. <strong>Close Ledger Live</strong> if it's running (only one app can connect at a time)</p>
			<p>6. Click "Connect" below and <strong>select your device</strong> in the browser dialog</p>
		</div>

		{#if connectionError}
			<div class="connection-status connection-instructions" style="background-color: var(--warning-background); border: 1px solid var(--warning-border);">
				<h4>Troubleshooting Tips:</h4>
				<p>• <strong>Most common:</strong> Make sure the <strong>Ethereum app is open</strong> on your Ledger</p>
				<p>• Exit to main menu and re-open the Ethereum app</p>
				<p>• Try disconnecting and reconnecting your Ledger device</p>
				<p>• Make sure no other applications are using the device</p>
				<p>• Restart your browser if the problem persists</p>
				<p>• Check that you're using a supported browser (Chrome/Edge 89+)</p>
			</div>
		{/if}

		<div class="buttons">
			<Button text="Back" onClick={goBack} />
			<Button text="Connect" onClick={connectToLedger} enabled={!$ledgerLoading} />
			{#if connectionError}
				<Button text="Try Again" onClick={handleTryAgain} />
			{/if}
		</div>
	{:else if step === 'select-account'}
		{#if $ledgerLoading}
			<div class="loading">
				<span>Loading accounts...</span>
			</div>
		{:else if accounts.length > 0}
			<h3>Select Account</h3>
			<p>Choose which account from your Ledger device to add as a wallet:</p>

			<div class="account-list">
				{#each accounts as account}
					<div class="account-item">
						<div class="account-info">
							<div class="account-name">{account.name}</div>
							<div class="account-address">{account.address}</div>
							{#if $debug}
								<div>Path: {account.path}</div>
								<div class="account-public-key">Public Key: {account.publicKey}</div>
								<div>Balance: {account.balance}</div>
							{/if}
						</div>
						<Button text="Select" onClick={() => selectAccount(account)} />
					</div>
				{/each}
			</div>
		{:else}
			<Alert type="warning" message="No accounts found. Make sure your Ledger is connected and the Ethereum app is open." />
		{/if}

		<div class="buttons">
			<Button text="Back" onClick={goBack} />
			{#if accounts.length === 0}
				<Button text="Retry" onClick={retry} />
			{/if}
		</div>
	{:else if step === 'configure'}
		<h3>Configure Wallet</h3>
		<p>Give your Ledger wallet a name:</p>

		<div class="form-section">
			<Label text="Wallet Name">
				<Input bind:value={walletName} placeholder="Enter wallet name" />
			</Label>
		</div>

		{#if selectedAccount}
			<div class="account-item">
				<div class="account-info">
					<div class="account-name">Selected Account</div>
					<div class="account-address">{selectedAccount.address}</div>
				</div>
			</div>
		{/if}

		<div class="buttons">
			<Button text="Back" onClick={goBack} />
			<Button text="Add Wallet" onClick={addWallet} enabled={!!walletName.trim()} />
		</div>
	{/if}
</div>
