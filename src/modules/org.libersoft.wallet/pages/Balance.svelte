<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { debug, isMobile } from '@/core/scripts/stores.ts';
	import { selectedNetwork } from 'libersoft-crypto/network';
	import { balance, isLoadingBalance, formatBalance, refreshBalance, type IBalance } from 'libersoft-crypto/balance';
	import { tokensForDisplay } from 'libersoft-crypto/tokens';
	import { nftsForDisplay } from 'libersoft-crypto/nfts';
	import { initializeRefreshSystem, refresh } from 'libersoft-crypto/refresh';
	import { isRefreshingExchangeRates } from 'libersoft-crypto/fiat';
	import { selectedAddress } from 'libersoft-crypto/wallet';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import Tr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';

	import { dynamicEllipsis } from '@/core/actions/dynamicEllipsis';
	import BalanceTable from '@/org.libersoft.wallet/components/BalanceTable.svelte';
	import BalanceNfts from '@/org.libersoft.wallet/components/BalanceNfts.svelte';

	// Cleanup function for refresh system
	let cleanupRefreshSystem: (() => void) | null = null;

	// Lifecycle
	onMount(() => {
		// Initialize the crypto library's refresh system
		cleanupRefreshSystem = initializeRefreshSystem();
	});

	onDestroy(() => {
		// Cleanup the refresh system
		if (cleanupRefreshSystem) {
			cleanupRefreshSystem();
			cleanupRefreshSystem = null;
		}
	});

	// Event handlers
	function selectCurrency() {
		console.log('SELECTED CURRENCY:', $selectedNetwork?.currency);
	}

	function selectToken(contractAddress: string) {
		console.log('SELECTED TOKEN:', contractAddress);
	}

	function selectNFT(url: string) {
		console.log('SELECTED NFT:', url);
		window.open(url, '_blank');
	}

	// Manual refresh trigger
	function refreshBalances() {
		refresh();
	}

	// Use the derived stores from tokens.ts and nfts.ts for display-ready data
</script>

<style>
	.wallet-balance {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

{#if $debug}
	<div class="debug-info">
		<h3>Debug Info</h3>
		<div>Selected Network: {$selectedNetwork?.name || 'None'}</div>
		<div>Selected Address: {$selectedAddress?.address || 'None'}</div>
		<div>Native Balance: {$balance ? JSON.stringify($balance.crypto) : 'None'}</div>
		<div>Native Fiat: {$balance?.fiat ? JSON.stringify($balance.fiat) : 'None'}</div>
		<div>NFTs: {$nftsForDisplay.length}</div>
	</div>
{/if}

<div class="wallet-balance">
	{#if $selectedNetwork && $selectedAddress}
		<BalanceTable
			title={'Currency'}
			items={[
				{
					iconURL: $selectedNetwork?.currency?.iconURL,
					name: null,
					symbol: $selectedNetwork?.currency?.symbol,
					address: null,
					balanceData: $balance,
					isLoadingName: false,
					isLoadingBalance: $isLoadingBalance,
					refreshFn: refreshBalance,
				},
			]}
		/>

		{#if $tokensForDisplay.length > 0}
			<BalanceTable title={'Token'} items={$tokensForDisplay} />
		{/if}

		{#if $nftsForDisplay && $nftsForDisplay.length > 0}
			<BalanceNfts />
		{/if}
	{/if}
</div>
