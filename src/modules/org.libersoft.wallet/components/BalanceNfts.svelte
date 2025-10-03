<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { debug, isMobile } from '@/core/scripts/stores.ts';
	import { selectedNetwork } from 'libersoft-crypto/network';
	import { balance, isLoadingBalance, formatBalance, type IBalance } from 'libersoft-crypto/balance';
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
			<Th>NFT Contract</Th>
			{#if !$isMobile}
				<Th>Collection</Th>
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
						{nft.contract_address} | contractInfo: {JSON.stringify(nft.collectionInfo)}
					</Td>
				</Tr>
			{/if}
			<Tr>
				<Td padding="0" expand class="ellipsis ellipsis-nft-balance dynamic-ellipsis" use={dynamicEllipsis} useParams={{ minHeight: 30 }}>
					<Clickable onClick={() => selectNFT('')}>
						<div class="item">
							<div class="currency">
								{@render currencyIcon('modules/' + module.identifier + '/img/nft.svg', 'NFT Contract')}
								{@render currencyNameAndSymbol(nft.collectionInfo?.loading ? 'Loading...' : nft.collectionInfo?.name || 'Unknown NFT', nft.collectionInfo?.collection || 'Unknown Collection', nft.contract_address)}
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
					<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="16px" padding="5px" onClick={() => rrrrrrr()} />
					{#if nft?.external_url}
						<Clickable onClick={() => selectNFT(nft.external_url!)}>
							<Icon img="img/external-link.svg" alt="View" size="16px" />
						</Clickable>
					{/if}
				</Td>
			</Tr>
		{/each}
	</Tbody>
</Table>
