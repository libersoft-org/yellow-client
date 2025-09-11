<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { get } from 'svelte/store';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import BaseSettingsSubtree from '@/core/components/Settings/BaseSettingsSubtree.svelte';
	import { networks } from 'libersoft-crypto/network';
	import { settingsObject } from '@/org.libersoft.wallet/scripts/settings';
	import { module } from '@/org.libersoft.wallet/scripts/module';

	const wizard = getContext('wizard') as { setNextText: (text: string) => void };
	let hasNetworks = $state(false);
	let activeName = $state('networks');

	// Extract just the networks section from the settings object
	const networksSection = $derived.by(() => {
		const fullSettings = get(settingsObject);
		const networksNode = fullSettings.items?.find(item => item.name === 'networks');
		return networksNode || { name: 'networks', title: 'Networks', items: [] };
	});

	onMount(() => {
		checkNetworks();
		const unsubscribe = networks.subscribe(() => {
			checkNetworks();
		});

		return unsubscribe;
	});

	function checkNetworks() {
		hasNetworks = get(networks).length > 0;
		if (hasNetworks) {
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
	<div class="title">Configure Networks</div>
	{#if !hasNetworks}
		<div class="description">Networks define which blockchains you can interact with. Use the settings below to add networks.</div>
	{/if}

	<div class="status {hasNetworks ? 'success' : 'warning'}">
		{#if hasNetworks}
			Networks configured!
		{:else}{/if}
	</div>

	<div class="settings-container">
		<BaseSettingsSubtree settingsObject={networksSection} bind:activeName testId="wizard-networks-settings" />
	</div>
</div>
