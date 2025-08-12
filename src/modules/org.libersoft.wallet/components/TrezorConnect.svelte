<script lang="ts">
	import { onMount } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { selectWallet, trezorState, initializeTrezor, trezorLoading, trezorError, staticSessionId, trezorDevices } from '@yellow-dev/crypto-utils/trezor';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

	let { onConnected }: { onConnected?: () => Promise<void> | void } = $props();

	onMount(async () => {
		await initializeTrezor();
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

	.error-message {
		color: var(--error-color);
		margin-top: 10px;
	}
</style>

<div class="status-card" class:connected={!!$trezorState} class:error={$trezorError}>
	<div class="status-text">
		{#if !!$trezorState}
			<strong>Trezor wallet selected</strong>
			<div>Device is ready to use.</div>
		{:else if $trezorError}
			<strong>Error</strong>
			<div>{$trezorError}</div>
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
	Trezor Devices:
	<ul>
		{#each $trezorDevices.values() as device}
			<li>
				{device.label} - {device.name}
				<div class="hw-id">({device.id})</div>
			</li>
		{/each}
	</ul>
{:else}
	<p>No Trezor devices found.</p>
{/if}

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

{#if $trezorError}
	<div class="error-message">
		Error: {$trezorError}
	</div>
{/if}

staticSessionId: {$staticSessionId}
