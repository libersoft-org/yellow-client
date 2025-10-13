<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { debug, isMobile } from '@/core/scripts/stores.ts';
	import { selectedNetwork } from 'libersoft-crypto/network';
	import { balance, isLoadingBalance, formatBalance, type IBalance } from 'libersoft-crypto/balance';
	import { tokensForDisplay } from 'libersoft-crypto/tokens';
	import { nftsForDisplay, refreshNftBalance } from 'libersoft-crypto/nfts';
	import { refresh } from 'libersoft-crypto/refresh';
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
	import BalanceTableSpinner from '@/org.libersoft.wallet/components/BalanceTableSpinner.svelte';
	import CurrencyIcon from '@/org.libersoft.wallet/components/CurrencyIcon.svelte';
	import CurrencyNameAndSymbol from '@/org.libersoft.wallet/components/CurrencyNameAndSymbol.svelte';

	// Event handlers
	function openExternalNftUrl(url: string) {
		console.log('SELECTED NFT url:', url);
		window.open(url, '_blank');
	}

	function refreshNfts() {
		refresh();
	}

	function refreshSingleNft(guid: string) {
		refreshNftBalance(guid);
	}
</script>

<style>
	.item {
		display: flex;
		flex-direction: column;
	}

	.item .currency {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	:global(.ellipsis.ellipsis-balance) {
		width: 70%;
	}

	@media (max-width: 768px) {
		/* Dynamic ellipsis for mobile - ::before gets dynamic height */
		:global(.ellipsis.ellipsis-token-balance.dynamic-ellipsis::after) {
			content: ''; /* Remove the ::after for dynamic ellipsis */
			display: none; /* Hide the ::after pseudo-element for dynamic ellipsis */
		}

		/* NFT balance uses ::before with dynamic height - no overrides needed */
		:global(.ellipsis.ellipsis-nft-balance .td__text) {
			flex: initial;
		}
	}
</style>

<Table>
	<Thead>
		<TheadTr backgroundColor="--secondary-background" color="--secondary-foreground">
			<Th>NFT</Th>
			{#if !$isMobile}
				<Th>Balance</Th>
			{/if}
			<Th></Th>
		</TheadTr>
	</Thead>
	<Tbody>
		{#each $nftsForDisplay as nft}
			{#if $debug}
				<Tr>
					<Td colspan={3} style="background: lightblue; padding: 5px;">
						<strong>Debug NFT:</strong>
						<pre>
						{JSON.stringify(nft, null, 2)}
						</pre>
					</Td>
				</Tr>
			{/if}
			<Tr>
				<Td padding="0" expand class="ellipsis ellipsis-nft-balance dynamic-ellipsis" use={dynamicEllipsis} useParams={{ minHeight: 30 }}>
					<!--{JSON.stringify(nft.tokenMetadata)}-->
					<img src={nft.tokenMetadata?.image || 'modules/' + module.identifier + '/img/nft.svg'} alt="NFT" style="width: 40px; height: 40px; object-fit: contain; margin-right: 10px; border-radius: 4px;" />
					<Clickable onClick={() => openExternalNftUrl(nft.tokenMetadata?.external_url || '')}>
						<div class="item">
							<div class="currency">
								<CurrencyIcon iconURL={'modules/' + module.identifier + '/img/nft.svg'} symbol={'NFT Contract'} />
								<CurrencyNameAndSymbol name={nft.displayName} address={nft.conf.contract_address} />
							</div>
							{#if $isMobile}
								{@render nftBalanceInfo(nft)}
							{/if}
						</div>
					</Clickable>
				</Td>
				{#if !$isMobile}
					<Td class="ellipsis ellipsis-nft-balance dynamic-ellipsis" use={dynamicEllipsis} useParams={{ minHeight: 30 }}>
						{@render nftBalanceInfo(nft)}
					</Td>
				{/if}
				<Td>
					<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="16px" padding="5px" onClick={() => refreshSingleNft(nft.conf.guid)} />
				</Td>
			</Tr>
		{/each}
	</Tbody>
</Table>

{#snippet nftBalanceInfo(contractInfo)}
	<div class="balance">
		<div class="info">
			{#if contractInfo?.isLoadingBalance}
				<div class="amount"><BalanceTableSpinner /></div>
			{:else if contractInfo?.balance}
				<div class="amount">{contractInfo.balance.amount}</div>
			{:else}
				<div class="amount">Cannot retrieve balance</div>
				<div class="fiat">(click refresh icon to retry)</div>
			{/if}
		</div>
	</div>
{/snippet}
