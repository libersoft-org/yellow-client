<script lang="ts">
	import { get } from 'svelte/store';
	import { debug, isMobile } from '@/core/scripts/stores.ts';
	import Window from '@/core/components/Window/Window.svelte';
	import { trezorWindow, isInitialized } from '@/org.libersoft.wallet/scripts/trezor.ts';

	import { getContext, onMount } from 'svelte';
	import { initializeTrezor, connectTrezor, getTrezorEthereumAccounts, trezorLoading, trezorError, trezorAccounts, trezorDevice, resetTrezorState, type TrezorAccount } from '@/org.libersoft.wallet/scripts/trezor';
	import { addHardwareWallet } from '@/org.libersoft.wallet/scripts/wallet';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

	const setSettingsSection = getContext<Function>('setSettingsSection');
	let walletName = '';
	let selectedAccount: TrezorAccount | null = null;

	let elWindow: Window | undefined = $state();

	onMount(async () => {
		trezorWindow.set(elWindow);
		if ($debug) {
			await elWindow.open();
		}
		return async () => {
			trezorWindow.set(undefined);
		};
	});

	export async function open() {
		await initializeTrezor();
	}

	async function handleConnect() {
		console.log('Connecting to Trezor...');
		const connected = await connectTrezor();
		console.log('Connection result:', connected);
	}

	//await loadAccounts();
	async function loadAccounts() {
		console.log('Loading Trezor accounts...');
		const accounts = await getTrezorEthereumAccounts(0, 10);
		console.log('Loaded accounts:', accounts);
	}

	function selectAccount(account: TrezorAccount) {
		console.log('Selected account:', account);
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

	function handleConnectClick() {
		if ($trezorLoading) {
			console.log('Already loading, ignoring click');
			return;
		}
		handleConnect().catch(error => {
			console.error('Error in handleConnect:', error);
			trezorError.set(`Error: ${error.message || error}`);
		});
	}

	function handleReset() {
		resetTrezorState();
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

<Window title="Trezor" width="600px" height="500px" testId="trezor-window" bind:this={elWindow}>
	<div class="trezor-setup">
		<div class="status-card" class:connected={!!$trezorDevice} class:error={$trezorError}>
			<div class="status-icon">
				{#if !!$trezorDevice}
					<Icon img="img/check.svg" size="24px" />
				{:else if $trezorError}
					<Icon img="img/cross.svg" size="24px" />
				{:else}
					?
				{/if}
			</div>
			<div class="status-text">
				{#if !!$trezorDevice}
					<strong>Trezor connected!</strong>
					<div>Device is ready to use.</div>
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
								console.log('initialization test...');
								await initializeTrezor();
								console.log('initialization finished.');
							}}
							>Manual initialization test
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
			{/if}
		</div>

		{#if $trezorError}
			<div class="error-message">
				Error: {$trezorError}
				<Button onClick={handleReset}>Reset and Retry</Button>
			</div>
		{/if}

		{#if $debug}
			{#if !!$trezorDevice}
				<Button
					onClick={async () => {
						console.log('Manual address reading test...');
						await loadAccounts();
					}}
					>Read Addresses
				</Button>
			{/if}

			<div style="margin-top: 20px; padding: 10px; background: var(--primary-softer-background); border-radius: 5px; font-size: 12px;">
				<strong>Debug Info:</strong><br />
				isInitialized: {isInitialized}<br />
				trezorDevice: {JSON.stringify($trezorDevice) || 'None'}<br />
				trezorLoading: {$trezorLoading}<br />
				trezorError: {$trezorError || 'None'}<br />
			</div>
		{/if}

		<Button img="img/cancel.svg" text="Close" onClick={elWindow?.close} style="margin-top: 20px;" testId="close-trezor-window-btn" />
	</div></Window
>
