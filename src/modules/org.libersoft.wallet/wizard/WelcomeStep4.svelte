<script lang="ts">
	import { get } from 'svelte/store';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import { networks } from 'libersoft-crypto/network';
	import { wallets } from 'libersoft-crypto/wallet';
	import { settingsWindow } from '@/org.libersoft.wallet/scripts/ui';
	import { module } from '@/org.libersoft.wallet/scripts/module';

	const networkCount = $derived(get(networks).length);
	const walletCount = $derived(get(wallets).length);
	const isFullySetup = $derived(networkCount > 0 && walletCount > 0);

	function openSettings() {
		const settings = get(settingsWindow);
		if (settings) {
			settings.open();
		}
	}
</script>

<style>
	.content {
		text-align: center;
	}

	.title {
		font-size: 25px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.subtitle {
		font-size: 16px;
		margin-bottom: 30px;
		color: var(--secondary-foreground);
	}

	.logo {
		display: flex;
		justify-content: center;
		margin: 20px 0;
	}

	.setup-summary {
		border-radius: 8px;
		padding: 20px;
		margin: 20px 0;
	}

	.summary-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 0;
		border-bottom: 1px solid var(--secondary-harder-background);
	}

	.summary-item:last-child {
		border-bottom: none;
	}

	.summary-label {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.summary-value {
		font-weight: bold;
	}

	.next-steps {
		text-align: left;
		margin-top: 30px;
	}

	.next-steps h3 {
		margin-bottom: 15px;
		text-align: center;
	}

	.next-steps ul {
		padding-left: 20px;
	}

	.next-steps li {
		margin-bottom: 8px;
		line-height: 1.4;
	}

	.actions {
		margin-top: 20px;
		display: flex;
		justify-content: center;
	}
</style>

<div class="content">
	{#if isFullySetup}
		<div class="title">You're All Set!</div>
		<div class="subtitle">Your wallet is ready to use</div>
	{:else}
		<div class="title">Setup Complete</div>
		<div class="subtitle">You can finish the remaining setup anytime</div>
	{/if}

	<div class="logo">
		<Icon img="modules/{module.identifier}/img/wallet.svg" alt={module.name} size="80px" />
	</div>

	<div class="setup-summary">
		<div class="summary-item">
			<div class="summary-label">
				<Icon img="modules/{module.identifier}/img/network.svg" size="20px" />
				<span>Networks configured</span>
			</div>
			<div class="summary-value">{networkCount}</div>
		</div>
		<div class="summary-item">
			<div class="summary-label">
				<Icon img="modules/{module.identifier}/img/wallet.svg" size="20px" />
				<span>Wallets created</span>
			</div>
			<div class="summary-value">{walletCount}</div>
		</div>
	</div>

	{#if isFullySetup}
		<div class="next-steps">
			<h3>You can now:</h3>
			<ul>
				<li>View your wallet balance and transaction history</li>
				<li>Send and receive cryptocurrency</li>
				<li>Add more networks and tokens</li>
				<li>Import/export your wallet data</li>
				<li>Connect hardware wallets for added security</li>
			</ul>
		</div>
	{:else}
		<div class="next-steps">
			<h3>Complete your setup:</h3>
			<ul>
				{#if networkCount === 0}
					<li>Add networks to connect to different blockchains</li>
				{/if}
				{#if walletCount === 0}
					<li>Create or import a wallet to manage your funds</li>
				{/if}
				<li>Explore the wallet settings for advanced options</li>
			</ul>
		</div>
		<div class="actions">
			<Button img="img/general.svg" text="Open Settings" onClick={openSettings} data-testid="open-settings" />
		</div>
	{/if}
</div>
