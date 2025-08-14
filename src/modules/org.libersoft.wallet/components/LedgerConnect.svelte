<script lang="ts">
	import { onMount } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { connectLedger, initializeLedger, ledgerLoading, ledgerError, ledgerConnected, ledgerDevice, ledgerConnectionMethod, ledgerDeviceId } from 'libersoft-crypto/ledger';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

	let { onConnected }: { onConnected?: () => Promise<void> | void } = $props();

	onMount(async () => {
		await initializeLedger();
	});

	async function handleConnectClick() {
		if ($ledgerLoading) return;
		const connected = await connectLedger();
		if (connected) {
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

	.error-message {
		color: var(--error-color);
		margin-top: 10px;
		white-space: pre-line;
	}

	.device-info {
		margin: 15px 0;
		padding: 10px;
		background-color: var(--secondary-softer-background);
		border-radius: 8px;
		border: 1px solid var(--secondary-border);
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
</style>

<div class="status-card" class:connected={$ledgerConnected} class:error={$ledgerError}>
	<div class="status-text">
		{#if $ledgerConnected && $ledgerDevice}
			<strong>Ledger wallet connected</strong>
			<div>Device is ready to use.</div>
			<div class="connection-method">Connection: {$ledgerConnectionMethod}</div>
		{:else if $ledgerError}
			<strong>Error</strong>
			<div>{$ledgerError}</div>
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
		{#if $debug}
			<p><strong>Device ID:</strong> {$ledgerDevice.id}</p>
		{/if}
		<p><strong>Status:</strong> {$ledgerConnected ? 'Connected' : 'Detected but not connected'}</p>
		<p><strong>Connection Method:</strong> {$ledgerConnectionMethod}</p>
	</div>
{:else if !$ledgerError}
	<p>No Ledger devices detected. Please ensure your device is:</p>
	<ul>
		<li>Connected via USB</li>
		<li>Unlocked with your PIN</li>
		<li>Has the Ethereum app open and ready</li>
		<li>Not being used by Ledger Live or other applications</li>
		<li>on linux, <code>wget -q -O - https://raw.githubusercontent.com/LedgerHQ/udev-rules/master/add_udev_rules.sh | sudo bash</code></li>
	</ul>
{/if}

<div class="buttons">
	<Button onClick={handleConnectClick} enabled={!$ledgerLoading} data-testid="connect-ledger-btn">
		{$ledgerLoading ? 'Connecting...' : 'Connect Ledger'}
	</Button>

	{#if $ledgerLoading}
		<div style="margin-left: 10px; color: var(--secondary-foreground);">Connecting...</div>
	{/if}
</div>

{#if $ledgerError}
	<div class="error-message">
		{$ledgerError}
	</div>
{/if}

{#if $debug}
	<div style="margin-top: 20px; font-size: 0.8em; color: var(--secondary-foreground);">
		<strong>Debug Info:</strong><br />
		Device ID: {$ledgerDeviceId || 'null'}<br />
		Connected: {$ledgerConnected}<br />
		Connection Method: {$ledgerConnectionMethod}<br />
		Loading: {$ledgerLoading}
	</div>
{/if}
