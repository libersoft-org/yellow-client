<script lang="ts">
	import { onMount } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { isInitialized, initializeTrezor, connectTrezor, getTrezorEthereumAccounts, trezorLoading, trezorError, trezorDevice, resetTrezor, type TrezorAccount } from '@/org.libersoft.wallet/scripts/trezor';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

	let { onConnected } = $props();

	onMount(async () => {
		await initializeTrezor();
	});

	async function handleConnect() {
		const connected = await connectTrezor();
		console.log('Connection result:', connected);
		if (connected) {
			console.log('calling onConnected callback:', onConnected);
			onConnected?.();
		}
	}

	async function loadAccounts() {
		const accounts = await getTrezorEthereumAccounts(0, 10);
		return accounts;
	}

	function handleConnectClick() {
		if ($trezorLoading) return;
		handleConnect().catch(error => {
			console.error('Error in handleConnect:', error);
			trezorError.set(`Connection error: ${error.message || error}`);
		});
	}

	function handleReset() {
		resetTrezor();
	}

	export { handleConnect, loadAccounts, handleReset };
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

	.status-icon {
		margin-right: 15px;
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

	.debug-info {
		margin-top: 20px;
		padding: 10px;
		background: var(--primary-softer-background);
		border-radius: 5px;
		font-size: 12px;
	}
</style>

<div class="status-card" class:connected={!!$trezorDevice} class:error={$trezorError}>
	<div class="status-icon">
		{#if !!$trezorDevice}
			<Icon img="img/check.svg" size="24px" />
		{:else if $trezorError}
			<Icon img="img/cross.svg" size="24px" />
		{:else}
			??
		{/if}
	</div>
	<div class="status-text">
		{#if !!$trezorDevice}
			<strong>Trezor connected!</strong>
			<div>Device is ready to use.</div>
			<Button onClick={handleReset}>Reset</Button>
		{:else if $trezorError}
			<strong>Connection failed</strong>
			<div>{$trezorError}</div>
		{:else}
			<strong>Connect your Trezor</strong>
			<div>Please connect your Trezor device and unlock it.</div>
		{/if}
	</div>
</div>

{#if $trezorLoading}
	<div class="loading">
		<Icon img="img/settings.svg" size="32px" />
		<div>Connecting to Trezor...</div>
	</div>
{/if}

<div class="buttons">
	{#if !$trezorDevice}
		{#if $debug}
			{#if !$isInitialized}
				<Button
					onClick={async () => {
						await initializeTrezor();
					}}
					>Manual initialization
				</Button>
			{/if}
		{/if}

		<Button onClick={handleConnectClick} enabled={!$trezorLoading} testId="connect-trezor-btn">
			{$trezorLoading ? 'Connecting...' : 'Connect Trezor'}
		</Button>

		{#if $trezorLoading}
			<div style="margin-left: 10px; color: var(--secondary-foreground);">
				Loading: {$trezorLoading}
			</div>
		{/if}
	{:else if $debug}
		<Button onClick={loadAccounts}>Read Addresses</Button>
	{/if}
</div>

{#if $trezorError}
	<div class="error-message">
		Error: {$trezorError}
		<Button onClick={handleReset}>Reset and Retry</Button>
	</div>
{/if}
