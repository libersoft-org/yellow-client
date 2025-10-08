<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { selectedNetwork } from 'libersoft-crypto/network';
	import { balance, isLoadingBalance, refreshBalance } from 'libersoft-crypto/balance';
	import { tokensForDisplay, refreshTokenBalance } from 'libersoft-crypto/tokens';
	import { nftsForDisplay } from 'libersoft-crypto/nfts';
	import { initializeRefreshSystem, refresh } from 'libersoft-crypto/refresh';
	import { selectedAddress } from 'libersoft-crypto/wallet';
	import BalanceTable from '@/org.libersoft.wallet/components/BalanceTable.svelte';
	import BalanceNfts from '@/org.libersoft.wallet/components/BalanceNfts.svelte';
	import { stringifyWithBigInt } from '@/core/scripts/utils/utils.js';

	onMount(() => {
		return initializeRefreshSystem();
	});

	function selectToken(contractAddress: string) {
		console.log('SELECTED TOKEN:', contractAddress);
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
					selectCurrency: () => selectToken(token.conf.contract_address || ''),
				}))}
			/>
		{/if}

		{#if $nftsForDisplay && $nftsForDisplay.length > 0}
			<BalanceNfts />
		{/if}
	{/if}
</div>
