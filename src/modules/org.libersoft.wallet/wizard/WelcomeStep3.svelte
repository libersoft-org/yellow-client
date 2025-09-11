<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { get } from 'svelte/store';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import BaseSettingsSubtree from '@/core/components/Settings/BaseSettingsSubtree.svelte';
	import { wallets } from 'libersoft-crypto/wallet';
	import { settingsObject } from '@/org.libersoft.wallet/scripts/settings';
	import { module } from '@/org.libersoft.wallet/scripts/module';

	const wizard = getContext('wizard') as { setNextText: (text: string) => void };
	let hasWallets = $state(false);
	let activeName = $state('wallets');

	// Extract just the wallets section from the settings object
	const walletsSection = $derived.by(() => {
		const fullSettings = get(settingsObject);
		const walletsNode = fullSettings.items?.find(item => item.name === 'wallets');
		return walletsNode || { name: 'wallets', title: 'Wallets', items: [] };
	});

	onMount(() => {
		checkWallets();
		const unsubscribe = wallets.subscribe(() => {
			checkWallets();
		});

		return unsubscribe;
	});

	function checkWallets() {
		hasWallets = get(wallets).length > 0;
		if (hasWallets) {
			wizard?.setNextText('Next');
		} else {
			wizard?.setNextText('Skip for now');
		}
	}
</script>

<style>
	.content {
		text-align: center;
	}

	.title {
		font-size: 20px;
		font-weight: bold;
	}

	.description {
		margin-bottom: 5px;
	}

	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
	}

	.status.success {
		background-color: var(--success-softer-background);
		border: 1px solid var(--success-harder-background);
		color: var(--success-foreground);
	}

	.status.warning {
		background-color: var(--warning-softer-background);
		border: 1px solid var(--warning-harder-background);
		color: var(--warning-foreground);
	}

	.settings-container {
		border: 1px solid var(--secondary-harder-background);
		border-radius: 8px;
	}
</style>

<div class="content">
	<div class="title">Create Your First Wallet</div>
	{#if !hasWallets}
		<div class="description">Wallets store your private keys and allow you to send and receive cryptocurrency. Use the settings below to create or connect a wallet.</div>
	{/if}

	<div class="status {hasWallets ? 'success' : 'warning'}">
		{#if hasWallets}
			Wallets configured!
		{:else}{/if}
	</div>

	<div class="settings-container">
		<BaseSettingsSubtree settingsObject={walletsSection} bind:activeName testId="wizard-wallets-settings" />
	</div>
</div>
