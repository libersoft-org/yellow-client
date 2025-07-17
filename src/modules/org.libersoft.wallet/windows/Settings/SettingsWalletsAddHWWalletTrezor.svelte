<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { initializeTrezor, connectTrezor, getTrezorEthereumAccounts, trezorConnected, trezorLoading, trezorError, trezorAccounts, trezorDevice, resetTrezorState, type TrezorAccount } from '@/org.libersoft.wallet/scripts/trezor';
	import { addHardwareWallet } from '@/org.libersoft.wallet/scripts/wallet';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	const setSettingsSection = getContext<Function>('setSettingsSection');
	let walletName = '';
	let selectedAccount: TrezorAccount | null = null;
	let step: 'connect' | 'select-account' | 'configure' = 'connect';
	let isInitialized = false;

	onMount(async () => {
		console.log('Mounting Trezor component, error state:', $trezorError);
		console.log('Initial states - trezorLoading:', $trezorLoading, 'trezorConnected:', $trezorConnected);
		// Pouze inicializace, bez automatického připojování
		const initialized = await initializeTrezor();
		isInitialized = initialized;
		console.log('Initialization completed:', initialized);
		if (!initialized && $trezorError) console.log('Initialization failed with error:', $trezorError);
	});

	$: if ($trezorConnected && step === 'connect' && isInitialized) loadAccounts();

	async function handleConnect() {
		console.log('handleConnect called, isInitialized:', isInitialized, 'trezorConnected:', $trezorConnected);

		if (!isInitialized) {
			console.log('Initializing Trezor...');
			const initialized = await initializeTrezor();
			console.log('Initialization result:', initialized);
			if (!initialized) {
				console.error('Failed to initialize Trezor');
				return;
			}
			isInitialized = true;
		}

		if ($trezorConnected) {
			console.log('Trezor already connected, loading accounts...');
			await loadAccounts();
		} else {
			console.log('Connecting to Trezor...');
			const connected = await connectTrezor();
			console.log('Connection result:', connected);
		}
	}

	async function loadAccounts() {
		console.log('Loading Trezor accounts...');
		const accounts = await getTrezorEthereumAccounts(0, 5);
		console.log('Loaded accounts:', accounts);
		if (accounts.length > 0) {
			step = 'select-account';
			console.log('Step changed to select-account');
		} else {
			console.error('No accounts loaded');
		}
	}

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
		else setSettingsSection('wallets-add-hw');
	}

	function handleConnectClick() {
		console.log('Connect button clicked, current states:');
		console.log('- trezorLoading:', $trezorLoading);
		console.log('- trezorConnected:', $trezorConnected);
		console.log('- isInitialized:', isInitialized);
		console.log('- trezorError:', $trezorError);

		// Prevent multiple clicks when loading
		if ($trezorLoading) {
			console.log('Already loading, ignoring click');
			return;
		}

		handleConnect().catch(error => {
			console.error('Error in handleConnect:', error);
			trezorError.set(`Connection error: ${error.message || error}`);
		});
	}

	function handleReset() {
		console.log('Resetting Trezor state...');
		resetTrezorState();
		isInitialized = false;
		step = 'connect';
		// Vyčistit lokální stav
		selectedAccount = null;
		walletName = '';
		// Znovu inicializovat po krátkém delay
		setTimeout(async () => {
			const initialized = await initializeTrezor();
			isInitialized = initialized;
			console.log('Re-initialization result:', initialized);
		}, 1000);
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

	{#if step === 'connect'}
		<div class="status-card" class:connected={$trezorConnected} class:error={$trezorError}>
			<div class="status-icon">
				{#if $trezorConnected}
					<Icon img="img/check.svg" size="24px" />
				{:else if $trezorError}
					<Icon img="img/cross.svg" size="24px" />
				{:else}
					<Icon img="img/indicator-cross.svg" size="24px" />
				{/if}
			</div>
			<div class="status-text">
				{#if $trezorConnected}
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
			<Button onClick={goBack}>Back</Button>
			<Button onClick={handleConnectClick} enabled={true}>
				{$trezorLoading ? 'Connecting...' : $trezorConnected ? 'Continue' : 'Connect Trezor'}
			</Button>
			{#if !isInitialized}
				<Button
					onClick={async () => {
						console.log('Manual initialization test...');
						const result = await initializeTrezor();
						console.log('Manual initialization result:', result);
						isInitialized = result;
					}}>Test Initialize</Button
				>
			{/if}
			{#if $trezorLoading}
				<div style="margin-left: 10px; color: var(--secondary-foreground);">
					Loading: {$trezorLoading}
				</div>
			{/if}
		</div>
	{:else if step === 'select-account'}
		<h3>Select Account</h3>
		<p>Choose which account you want to add to your wallet:</p>

		{#if $trezorLoading}
			<div class="loading">
				<Icon img="img/settings.svg" size="32px" />
				<div>Loading accounts...</div>
			</div>
		{:else}
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
		{/if}

		<div class="buttons">
			<Button onClick={goBack}>Back</Button>
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
					<strong>Selected Account:</strong>
					<div class="account-address">{selectedAccount.address}</div>
				</div>
			</div>
		{/if}

		<div class="buttons">
			<Button onClick={goBack}>Back</Button>
			<Button onClick={addWallet} enabled={!!walletName.trim()}>Add Wallet</Button>
		</div>
	{/if}

	{#if $trezorError}
		<div class="error-message">
			Error: {$trezorError}
			{#if $trezorError.includes('already initialized')}
				<div style="margin-top: 10px;">
					<Button onClick={handleReset}>Reset and Retry</Button>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Debug Information -->
	<div style="margin-top: 20px; padding: 10px; background: var(--primary-softer-background); border-radius: 5px; font-size: 12px;">
		<strong>Debug Info:</strong><br />
		isInitialized: {isInitialized}<br />
		trezorConnected: {$trezorConnected}<br />
		trezorLoading: {$trezorLoading}<br />
		trezorError: {$trezorError || 'None'}<br />
		current step: {step}
	</div>
</div>
