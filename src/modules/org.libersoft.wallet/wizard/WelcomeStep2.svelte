<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { get } from 'svelte/store';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { networks, default_networks, addNetwork } from 'libersoft-crypto/network';
	import { module } from '@/org.libersoft.wallet/scripts/module';

	const wizard = getContext('wizard') as { setNextText: (text: string) => void };
	let hasNetworks = $state(false);

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

	async function addDefaultNetworksHandler() {
		const defaultNetworksList = get(default_networks);
		defaultNetworksList.forEach(network => {
			addNetwork(network);
		});
		checkNetworks();
	}
</script>

<style>
	.content {
		text-align: center;
	}

	.title {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.description {
		margin-bottom: 30px;
		line-height: 1.5;
		color: var(--secondary-foreground);
	}

	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 20px;
		border-radius: 8px;
		margin: 20px 0;
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

	.actions {
		display: flex;
		justify-content: center;
		gap: 10px;
	}
</style>

<div class="content">
	<div class="title">Configure Networks</div>
	<div class="description">Networks define which blockchains you can interact with. Add some popular networks to get started quickly.</div>

	{#if hasNetworks}
		<div class="status success">
			<Icon img="img/check.svg" size="20px" />
			Networks configured! You have {get(networks).length} network(s) available.
		</div>
	{:else}
		<div class="status warning">
			<Icon img="img/warning.svg" size="20px" />
			No networks configured. Add some to start using your wallet.
		</div>
		<div class="actions">
			<Button img="modules/{module.identifier}/img/network-add.svg" text="Add Popular Networks" onClick={addDefaultNetworksHandler} data-testid="add-default-networks" />
		</div>
	{/if}
</div>
