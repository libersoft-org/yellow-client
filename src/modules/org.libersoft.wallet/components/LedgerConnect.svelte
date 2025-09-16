<script lang="ts">
	import { onMount } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { getLedgerEthereumAccounts, connectLedger, initializeLedger, ledgerLoading, ledgerError, ledgerConnected, ledgerDevice, ledgerConnectionMethod, ledgerDeviceId, type LedgerAccount } from 'libersoft-crypto/ledger';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';

	let { onConnected }: { onConnected?: () => Promise<void> | void } = $props();
	let firstAccount = $state<LedgerAccount | null>(null);

	let isSupportedBrowser = false;

	onMount(async () => {
		await initializeLedger();
	});

	async function loadFirstAccount() {
		// Load just the first account for informative display
		const accounts = await getLedgerEthereumAccounts(0, 1);
		if (accounts.length > 0) {
			firstAccount = accounts[0];
			console.log('loadFirstAccount: ', $ledgerDevice);
		}
	}

	async function handleConnectClick() {
		if ($ledgerLoading) return;
		const connected = await connectLedger();
		if (connected) {
			await loadFirstAccount();
			await onConnected?.();
		}
	}
</script>

<style>
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

	.status-text {
		flex: 1;
	}

	.loading {
		text-align: center;
		padding: 20px;
	}

	.buttons {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		margin-top: 20px;
	}

	.device-info {
		margin: 15px 0;
		padding: 10px;
		border-radius: 8px;
	}

	.device-info h4 {
		margin: 0 0 8px 0;
		color: var(--primary-foreground);
	}

	.device-info p {
		margin: 4px 0;
		font-size: 0.9em;
	}

	.connection-method {
		font-size: 0.8em;
		color: var(--secondary-foreground);
		margin-top: 5px;
	}

	.ledger-setup {
		max-width: 500px;
		margin: 0 auto;
		padding: 20px;
	}
</style>

{#if !$ledgerDevice && !isSupportedBrowser}
	<Alert type="warning">Ledger is supported in <span class="bold">Chrome/Edge 89+</span> only.</Alert>
{/if}

<div class="status-card" class:connected={$ledgerConnected} class:error={$ledgerError}>
	<div class="status-text">
		{#if $ledgerConnected && $ledgerDevice}
			<strong>Ledger wallet connected</strong>
			<div>Device is ready to use.</div>
			<div class="connection-method">Connection: {$ledgerConnectionMethod}</div>
		{:else if $ledgerError}
			<strong>Error</strong>
		{:else}
			<strong>Connect your Ledger</strong>
			<div>Please connect your Ledger device, unlock it, open the Ethereum app, and click Connect Ledger.</div>
			<div class="connection-method">Preferred method: {$ledgerConnectionMethod}</div>
		{/if}
	</div>
</div>

{#if $ledgerLoading}
	<div class="loading">
		<Icon img="img/settings.svg" size="32px" />
		<div>Connecting to Ledger...</div>
	</div>
{/if}

{#if $ledgerDevice}
	<div class="device-info">
		<h4>Ledger Device Information</h4>
		<p><strong>Name:</strong> {$ledgerDevice.deviceModel?.model || $ledgerDevice.name}</p>
		{#if $ledgerDevice.deviceModel?.internal_model && $ledgerDevice.deviceModel.internal_model !== 'ledger'}
			<p><strong>Model:</strong> {$ledgerDevice.deviceModel.internal_model}</p>
		{/if}
		<p><strong>Status:</strong> {$ledgerConnected ? 'Connected' : 'Detected but not connected'}</p>
		<p><strong>Connection Method:</strong> {$ledgerConnectionMethod}</p>
		{#if firstAccount}
			<p><strong>First Address:</strong> {firstAccount.address}</p>
		{/if}
	</div>
{:else}
	<div class="ledger-setup">
		<div class="bold">Connect your Ledger device:</div>
		<ol>
			<li><span class="bold">Close Ledger Live</span> if it's running</li>
			<li><span class="bold">Connect</span> your Ledger device to your computer via USB</li>
			<li>Unlock your device by entering your PIN</li>
			<li>Open the <span class="bold">Ethereum app</span> on your Ledger device</li>
			<li>Click "<span class="bold">Connect</span>" below and <strong>select your device</strong> in the browser dialog</li>
		</ol>

		{#if $ledgerError}
			<div>{$ledgerError}</div>
			<p>Please ensure your device is:</p>
			<ul>
				<li>Connected via USB</li>
				<li>Unlocked with your PIN</li>
				<li>Has the Ethereum app open and ready</li>
				<li>Not being used by Ledger Live or other applications</li>
				<li>On linux, <code>wget -q -O - https://raw.githubusercontent.com/LedgerHQ/udev-rules/master/add_udev_rules.sh | sudo bash</code></li>
			</ul>
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
	</div>
{/if}

{#if $debug}
	<p class="debug"><strong>Device ID:</strong> {$ledgerDevice?.id}</p>
{/if}

<div class="buttons">
	<Button onClick={handleConnectClick} enabled={!$ledgerLoading} data-testid="connect-ledger-btn">
		{$ledgerLoading ? 'Connecting...' : 'Connect Ledger'}
	</Button>

	{#if $ledgerLoading}
		<div style="margin-left: 10px; color: var(--secondary-foreground);">Connecting...</div>
	{/if}
</div>
