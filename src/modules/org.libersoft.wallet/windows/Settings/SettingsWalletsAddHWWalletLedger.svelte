<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { getContext } from 'svelte';
	import { addHardwareWallet } from 'libersoft-crypto/wallet';
	import { connectLedger, getLedgerEthereumAccounts, ledgerLoading, ledgerDevice, ledgerConfig, ledgerError, ledgerConnected, getLedgerDeviceIdentifiers, type LedgerAccount } from 'libersoft-crypto/ledger';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';

	const setSettingsSection = getContext<Function>('setSettingsSection');

	let walletName = $state('');
	let firstAccount = $state<LedgerAccount | null>(null);
	let step = $state<'connect' | 'configure'>('connect');
	let connectionError = $state('');

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
	}

	.connection-instructions {
		border: 1px solid var(--secondary-border);
		background-color: var(--primary-soft-background);
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
	<Alert type="warning">Ledger is supported in <span class="bold">Chrome/Edge 89+</span> only.</Alert>
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
			<div class="bold">Connect your Ledger device:</div>
			<br />
			<ol>
				<li><span class="bold">Close Ledger Live</span> if it's running</li>
				<li><span class="bold">Connect</span> your Ledger device to your computer via USB</li>
				<li>Unlock your device by entering your PIN</li>
				<li>Open the <span class="bold">Ethereum app</span> on your Ledger device</li>
				<li>Click "<span class="bold">Connect</span>" below and <strong>select your device</strong> in the browser dialog</li>
			</ol>
		</div>

		{#if connectionError || $ledgerError}
			<div class="connection-status connection-instructions" style="border: 1px solid var(--warning-border);">
				<div class="bold">Troubleshooting tips:</div>
				{#if $ledgerError && $ledgerError.includes('Locked device')}
					<Alert type="error">Device is locked: Please unlock your Ledger device by entering your PIN.</Alert>
				{:else if $ledgerError && ($ledgerError.includes('CLA_NOT_SUPPORTED') || $ledgerError.includes('Ethereum app'))}
					<Alert type="error">Ethereum app not open: Please open the Ethereum app on your Ledger device.</Alert>
				{:else if $ledgerError && $ledgerError.includes('busy')}
					<Alert type="error">Device busy: Please close Ledger Live and try again.</Alert>
				{/if}
				<ul>
					<li>Check that you're using a supported browser (Chrome/Edge 89+)</li>
					<li>Make sure the <strong>Ethereum app is open</strong> on your Ledger</li>
					<li>Make sure your device is <strong>unlocked</strong> with your PIN</li>
					<li>Exit to main menu and re-open the Ethereum app</li>
					<li>Try disconnecting and reconnecting your Ledger device</li>
					<li>Make sure no other applications are using the device</li>
					<li>Restart your browser if the problem persists</li>
				</ul>
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
