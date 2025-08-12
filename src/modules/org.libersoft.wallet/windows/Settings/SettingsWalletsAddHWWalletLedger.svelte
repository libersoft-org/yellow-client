<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { getContext, onMount } from 'svelte';
	import { addHardwareWallet } from '@yellow-dev/crypto-utils/wallet';
	import { initWalletLedger } from '@yellow-dev/crypto-utils/ledger-integration';
	import { connectLedger, getLedgerEthereumAccounts, ledgerLoading, ledgerDevice, ledgerConfig, ledgerError, ledgerConnected, getLedgerDeviceIdentifiers, type LedgerAccount } from '@yellow-dev/crypto-utils/ledger';
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
		await initWalletLedger();
	});

	async function connectToLedger() {
		connectionError = '';
		const connected = await connectLedger();
		if (connected) {
			step = 'configure';
			await loadFirstAccount();
		} else {
			// The ledgerError store will have the specific error details
			// We'll display those in the UI directly from the store
			if (!$ledgerError) {
				connectionError = 'Failed to connect to Ledger device. Please ensure your device is connected and unlocked.';
			}
		}
	}

	async function loadFirstAccount() {
		// Load just the first account for informative display
		const accounts = await getLedgerEthereumAccounts(0, 1);
		if (accounts.length > 0) {
			firstAccount = accounts[0];
			// Pre-fill wallet name with device model name if available
			console.log('loadFirstAccount: ', $ledgerDevice);
			walletName = $ledgerDevice?.name || 'Ledger Wallet';
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
		background-color: var(--primary-softer-background);
		border: 1px solid var(--secondary-border);
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

	<!-- Display ledger error information even before connecting -->
	{#if $ledgerError}
		<Alert type="error">
			<div style="white-space: pre-line;">{$ledgerError}</div>
		</Alert>
	{/if}

	{#if step === 'connect'}
		<!-- Device Status Information -->
		{#if $ledgerDevice}
			<div class="connection-status" style=" border: 1px solid var(--success-color);">
				<h4>Device Detected</h4>
				<p><strong>Device:</strong> {$ledgerDevice.deviceModel?.model || $ledgerDevice.name}</p>
				{#if $ledgerDevice.deviceModel?.internal_model !== 'ledger' && $ledgerDevice.deviceModel?.internal_model !== 'unknown'}
					<p><small>Model: {$ledgerDevice.deviceModel?.internal_model}</small></p>
				{/if}
				{#if $debug}
					<p><small>Device ID: {$ledgerDevice.id}</small></p>
				{/if}
				{#if $ledgerConnected}
					<p style="color: var(--success-color);">✓ Connected and ready</p>
				{:else}
					<p>Device detected but not fully connected</p>
				{/if}
			</div>
		{:else if $ledgerError}
			<div class="connection-status" style="border: 1px solid var(--error-color);">
				<h4>Device Status</h4>
				<p>Device detection attempted but encountered an issue.</p>
				<p><small>This may be normal if your device is locked or the Ethereum app isn't open.</small></p>
			</div>
		{/if}

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

		{#if connectionError || $ledgerError}
			<div class="connection-status connection-instructions" style="border: 1px solid var(--warning-border);">
				<h4>Troubleshooting Tips:</h4>
				{#if $ledgerError && $ledgerError.includes('Locked device')}
					<p>🔒 <strong>Device is locked:</strong> Please unlock your Ledger device by entering your PIN.</p>
				{:else if $ledgerError && ($ledgerError.includes('CLA_NOT_SUPPORTED') || $ledgerError.includes('Ethereum app'))}
					<p>📱 <strong>Ethereum app not open:</strong> Please open the Ethereum app on your Ledger device.</p>
				{:else if $ledgerError && $ledgerError.includes('busy')}
					<p>🚫 <strong>Device busy:</strong> Please close Ledger Live and try again.</p>
				{:else}
					<p>• <strong>Most common:</strong> Make sure the <strong>Ethereum app is open</strong> on your Ledger</p>
					<p>• Make sure your device is <strong>unlocked</strong> with your PIN</p>
				{/if}
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
	{:else if step === 'configure'}
		{#if $ledgerLoading}
			<div class="loading">
				<span>Loading device information...</span>
			</div>
		{:else}
			<h3>Configure Wallet</h3>
			<p>Your Ledger device is ready. Give your wallet a name:</p>

			<div class="form-section">
				<Label text="Wallet Name">
					<Input bind:value={walletName} placeholder="Enter wallet name" />
				</Label>
			</div>

			{#if firstAccount}
				<div class="connection-status connection-instructions">
					<h4>Device Information</h4>
					{#if $ledgerDevice}
						<p><strong>Device Model:</strong> {$ledgerDevice.deviceModel?.model || $ledgerDevice.name}</p>
						{#if $ledgerDevice.deviceModel?.internal_model !== 'ledger' && $ledgerDevice.deviceModel?.internal_model !== 'unknown'}
							<p><small>Model ID: {$ledgerDevice.deviceModel?.internal_model}</small></p>
						{/if}
					{/if}
					{#if $ledgerConfig}
						<p><strong>App Version:</strong> {$ledgerConfig.version}</p>
						{#if $ledgerConfig.arbitraryDataEnabled !== undefined}
							<p><small>Arbitrary Data: {$ledgerConfig.arbitraryDataEnabled ? 'Enabled' : 'Disabled'}</small></p>
						{/if}
						{#if $ledgerConfig.erc20ProvisioningNecessary !== undefined}
							<p><small>ERC20 Provisioning: {$ledgerConfig.erc20ProvisioningNecessary ? 'Required' : 'Not Required'}</small></p>
						{/if}
					{/if}
					<p><strong>First Address:</strong> {firstAccount.address}</p>
					<p><small>This wallet will represent your entire Ledger device. You can add more addresses after creating the wallet.</small></p>
					{#if $debug}
						{#if $ledgerDevice}
							<p><small>Device ID: {$ledgerDevice.id}</small></p>
						{/if}
						{#if $ledgerConfig}
							<p><small>Full Config: {JSON.stringify($ledgerConfig, null, 2)}</small></p>
						{/if}
					{/if}
				</div>
			{/if}

			<div class="buttons">
				<Button text="Back" onClick={goBack} />
				<Button text="Add Wallet" onClick={addWallet} enabled={!!walletName.trim() && !!firstAccount} />
			</div>
		{/if}
	{/if}
</div>
