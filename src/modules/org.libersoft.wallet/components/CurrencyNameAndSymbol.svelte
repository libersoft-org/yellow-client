<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import BalanceTableSpinner from '@/org.libersoft.wallet/components/BalanceTableSpinner.svelte';

	interface Props {
		name?: string | null;
		symbol?: string | null;
		address?: string | null;
		isLoading?: boolean;
	}

	let { name, symbol, address = null, isLoading = false }: Props = $props();
</script>

<style>
	.name {
		font-size: 20px;
		font-weight: bold;
	}

	.address {
		font-size: 12px;
	}
</style>

<div class="name td__text">
	{#if isLoading}
		<BalanceTableSpinner />
	{:else if name && symbol}
		{name} ({symbol})
	{:else if name && !symbol}
		{name}
	{:else if !name && symbol}
		{symbol}
	{:else}
		Unknown
	{/if}
</div>
{#if ($debug || (!name && !symbol)) && !!address}
	<div class="address">{address}</div>
{/if}
