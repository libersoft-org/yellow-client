<script lang="ts">
	import { onMount } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { selectWallet, trezorState, initializeTrezor, trezorDevice, trezorLoading, trezorError, staticSessionId, trezorDevices, usePopup } from 'libersoft-crypto/trezor';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';

	let { onConnected }: { onConnected?: () => Promise<void> | void } = $props();

	onMount(async () => {
		//await initializeTrezor();
	});

	async function handleConnectClick() {
		if ($trezorLoading) return;
		await selectWallet();
		await onConnected?.();
	}
</script>

<style>
	.hw-id {
		font-size: 0.8em;
		margin-left: 5px;
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
</style>

{#if $debug}
	<hr />
	<code>staticSessionId: {$staticSessionId}</code>
	<hr />
	<pre>$trezorState: {JSON.stringify($trezorState, null, 2)}</pre>
	<hr />
	<pre>$trezorLoading: {$trezorLoading}</pre>
	<hr />
	<pre>$trezorError: {$trezorError}</pre>
	<hr />
{/if}

<div class="status-card" class:connected={!!$trezorState} class:error={$trezorError}>
	<div class="status-text">
		{#if !!$trezorState}
			<strong>Trezor wallet selected</strong>
			<div>Device is ready to use. ({$trezorDevice})</div>
		{:else if $trezorError}
			<strong>Error</strong>
			<div><code>{$trezorError}</code></div>
			{#if $trezorError === 'Transport is missing'}
				<div>Please ensure that <a href="https://trezor.io/trezor-suite" target="_blank" rel="noopener noreferrer">Trezor Suite</a> is installed and running.</div>
			{/if}
		{:else}
			<strong>Connect your Trezor</strong>
			<div>Please connect your Trezor device and click Select Trezor Wallet.</div>
		{/if}
	</div>
</div>

{#if $trezorLoading}
	<div class="loading">
		<Icon img="img/settings.svg" size="32px" />
		<div>Connecting to Trezor...</div>
	</div>
{/if}

{#if $trezorDevices.size > 0}
	Trezor Devices: {#if $debug}<span class="hw-id">({$trezorDevices.size})</span>{/if}
	<ul>
		{#each $trezorDevices.values() as device}
			<li>
				{device.label} - {device.name}
				<div class="hw-id">({device.id})</div>
			</li>
			{#if $debug}
				<pre>{JSON.stringify(device, null, 2)}</pre>
			{/if}
		{/each}
	</ul>
{:else}
	<!--	<p>No Trezor devices found.</p>-->
{/if}

<Switch bind:checked={$usePopup} showLabel="true" label="Use Trezor popup (WebHID) instead of Trezor Connect (TrezorSuite App)" />

<div class="buttons">
	<Button onClick={handleConnectClick} enabled={!$trezorLoading} data-testid="connect-trezor-btn">
		{$trezorLoading ? 'Connecting...' : 'Select Trezor Wallet'}
	</Button>

	{#if $trezorLoading}
		<div style="margin-left: 10px; color: var(--secondary-foreground);">
			Loading: {$trezorLoading}
		</div>
	{/if}
</div>

{#if !$trezorState}
	<div class="troubleshooting">
		<h3>Troubleshooting</h3>
		<p>If you encounter issues, please ensure:</p>
		<ul>
			<li>Your Trezor device is connected.</li>
			<li>The Trezor Suite is installed and running.</li>
			<li>Your device is unlocked with the correct PIN.</li>
		</ul>
		<p>If the problem persists, try reconnecting your device or restarting the Trezor Suite.</p>
	</div>
{/if}
