<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { selectedNetwork } from 'libersoft-crypto/network';
	import { balance, isLoadingBalance, refreshBalance } from 'libersoft-crypto/balance';
	import { tokensForDisplay, refreshTokenBalance } from 'libersoft-crypto/tokens';
	import { nftsForDisplay } from 'libersoft-crypto/nfts';
	import { initializeRefreshSystem, refresh } from 'libersoft-crypto/refresh';
	import { selectedAddress, setSendCurrency } from 'libersoft-crypto/wallet';
	import { setSection } from '@/org.libersoft.wallet/scripts/ui';
	import BalanceTable from '@/org.libersoft.wallet/components/BalanceTable.svelte';
	import BalanceNfts from '@/org.libersoft.wallet/components/BalanceNfts.svelte';
	import { stringifyWithBigInt } from '@/core/scripts/utils/utils.js';
	import { section } from '@/org.libersoft.wallet/scripts/ui';

	onMount(() => {
		return initializeRefreshSystem();
	});

	function selectToken(symbol: string) {
		console.log('SELECTED TOKEN:', symbol);
		setSendCurrency($state.snapshot(symbol)); // Use snapshot to get plain value from proxy
		setSection('send');
		console.log('Set send currency to:', symbol, 'and switched to section', $section);
	}

	function selectNativeCurrency(symbol: string) {
		console.log('SELECTED NATIVE CURRENCY:', symbol);
		setSendCurrency($state.snapshot(symbol)); // Use snapshot to get plain value from proxy
		setSection('send');
	}
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
		<div>Native Balance: {$balance ? stringifyWithBigInt($balance.crypto) : 'None'}</div>
		<div>Native Fiat: {$balance?.fiat ? stringifyWithBigInt($balance.fiat) : 'None'}</div>
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
					selectCurrency: () => selectNativeCurrency($selectedNetwork?.currency?.symbol || ''),
				},
			]}
		/>

		{#if $tokensForDisplay.length > 0}
			<BalanceTable
				title={'Token'}
				items={$tokensForDisplay.map(token => ({
					iconURL: token.conf.iconURL,
					name: token.info?.name,
					symbol: token.info?.symbol || 'UNKNOWN',
					address: token.conf.contract_address,
					balanceData: token.balance,
					isLoadingName: token.isLoadingInfo,
					isLoadingBalance: token.isLoadingBalance,
					refreshFn: () => refreshTokenBalance(token.conf.contract_address || ''),
					selectCurrency: () => selectToken(token.info?.symbol || 'UNKNOWN'),
				}))}
			/>
		{/if}

		{#if $nftsForDisplay && $nftsForDisplay.length > 0}
			<BalanceNfts />
		{/if}
	{/if}
</div>
