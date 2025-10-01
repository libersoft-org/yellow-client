<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { debug, isMobile } from '@/core/scripts/stores.ts';
	import { selectedNetwork } from 'libersoft-crypto/network';
	import { balance, isLoadingBalance, formatBalance, type IBalance } from 'libersoft-crypto/balance';
	import { tokenBalances, tokensForDisplay } from 'libersoft-crypto/tokens';
	import { nftsForDisplay } from 'libersoft-crypto/nfts';
	import { initializeRefreshSystem, refresh, isRefreshingMainBalance } from 'libersoft-crypto/refresh';
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

	// Cleanup function for refresh system
	let cleanupRefreshSystem: (() => void) | null = null;

	// Helpers to split formatted balance into value and symbol parts
	function getBalanceParts(b: IBalance, fractionDigits?: number): { value: string; symbol: string } {
		try {
			const formattedRaw = fractionDigits !== undefined ? formatBalance(b, fractionDigits) : formatBalance(b);
			const formatted = (formattedRaw ?? '').toString();
			const lastSpace = formatted.lastIndexOf(' ');
			if (lastSpace > 0) {
				return { value: formatted.slice(0, lastSpace), symbol: formatted.slice(lastSpace + 1) };
			}
			return { value: formatted, symbol: (b?.currency ?? '') as string };
		} catch (e) {
			return { value: '', symbol: (b?.currency ?? '') as string };
		}
	}

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
		gap: 20px;
		padding: 20px;
	}

	.balance-section {
		background: var(--background-secondary);
		border-radius: 8px;
		padding: 20px;
	}

	.balance-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}

	.balance-header h2 {
		margin: 0;
		font-size: 18px;
	}

	.balance-display {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.crypto-balance {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 24px;
		font-weight: 600;
	}

	.refreshing-indicator {
		opacity: 0.7;
	}

	.fiat-balance {
		font-size: 16px;
		color: var(--text-secondary);
	}

	.value {
		font-weight: 600;
	}

	.symbol {
		color: var(--text-secondary);
		margin-left: 4px;
	}

	.no-balance {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text-secondary);
	}

	.tokens-section,
	.nfts-section {
		background: var(--background-secondary);
		border-radius: 8px;
		padding: 20px;
	}

	.tokens-section h3,
	.nfts-section h3 {
		margin: 0 0 15px 0;
		font-size: 16px;
	}

	.token-info,
	.nft-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.token-name,
	.nft-name {
		font-weight: 600;
	}

	.token-symbol,
	.collection-symbol {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.contract-address {
		font-size: 11px;
		color: var(--text-tertiary);
		font-family: monospace;
	}

	.collection-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.collection-name {
		font-weight: 500;
	}

	.token-id {
		font-family: monospace;
		font-size: 12px;
	}

	.no-data {
		color: var(--text-secondary);
		font-style: italic;
	}

	.debug-info {
		background: var(--background-tertiary);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 10px;
		margin-bottom: 20px;
		font-size: 12px;
	}

	.debug-info h3 {
		margin: 0 0 10px 0;
		font-size: 14px;
	}

	.debug-info div {
		margin-bottom: 4px;
	}
</style>

{#if $debug}
	<div class="debug-info">
		<h3>Debug Info</h3>
		<div>Selected Network: {$selectedNetwork?.name || 'None'}</div>
		<div>Selected Address: {$selectedAddress?.address || 'None'}</div>
		<div>Native Balance: {$balance ? JSON.stringify($balance.crypto) : 'None'}</div>
		<div>Token Balances: {$tokenBalances.size}</div>
		<div>NFTs: {$nftsForDisplay.length}</div>
	</div>
{/if}

<div class="wallet-balance">
	<div class="balance">
		<div class="balance-section">
			<div class="balance-header">
				<h2>Native Balance</h2>
				<div class="refresh-controls">
					<Clickable onClick={refreshBalances}>
						{#if $isRefreshingMainBalance}
							<Spinner size="16px" />
						{:else}
							<Icon img="img/reset.svg" alt="Refresh" />
						{/if}
					</Clickable>
				</div>
			</div>

			{#if $balance}
				{@const cryptoParts = getBalanceParts($balance.crypto)}
				{@const fiatParts = $balance.fiat ? getBalanceParts($balance.fiat) : null}

				<div class="balance-display">
					<div class="crypto-balance">
						<span class="value">{cryptoParts.value}</span>
						<span class="symbol">{cryptoParts.symbol}</span>
						{#if $isRefreshingMainBalance}
							<span class="refreshing-indicator">
								<Spinner size="12px" />
							</span>
						{/if}
					</div>
					{#if fiatParts}
						<div class="fiat-balance">
							≈ <span class="value">{fiatParts.value}</span>
							<span class="symbol">{fiatParts.symbol}</span>
						</div>
					{/if}
				</div>
			{:else}
				<div class="no-balance">
					{#if $isLoadingBalance}
						<Spinner size="20px" />
						Loading balance...
					{:else}
						No balance data
					{/if}
				</div>
			{/if}
		</div>
	</div>

	{#if $tokensForDisplay.length > 0}
		<div class="tokens-section">
			<h3>Tokens</h3>
			<Table>
				<Thead>
					<TheadTr>
						<Th>Token</Th>
						<Th>Balance</Th>
						<Th>Fiat Value</Th>
						<Th>Actions</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					{#each $tokensForDisplay as tokenData}
						{@const { token, info, balance, isLoadingInfo, isLoadingBalance, symbol, name } = tokenData}
						<Tr>
							<Td>
								<div class="token-info">
									<div class="token-name">{name}</div>
									<div class="token-symbol">{symbol}</div>
									<div class="contract-address" use:dynamicEllipsis={{}}>{token.contract_address}</div>
								</div>
							</Td>
							<Td>
								{#if isLoadingBalance}
									<Spinner size="16px" />
								{:else if balance}
									{@const parts = getBalanceParts(balance.crypto)}
									<span class="balance-value">{parts.value} {parts.symbol}</span>
								{:else}
									<span class="no-data">—</span>
								{/if}
							</Td>
							<Td>
								{#if isLoadingBalance}
									<Spinner size="16px" />
								{:else if balance?.fiat}
									{@const parts = getBalanceParts(balance.fiat)}
									<span class="fiat-value">{parts.value} {parts.symbol}</span>
								{:else}
									<span class="no-data">—</span>
								{/if}
							</Td>
							<Td>
								<Clickable onClick={() => selectToken(token.contract_address)}>
									<Icon img="img/send.svg" alt="Select" size="16px" />
								</Clickable>
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{/if}

	{#if $nftsForDisplay.length > 0}
		<div class="nfts-section">
			<h3>NFTs</h3>
			<Table>
				<Thead>
					<TheadTr>
						<Th>NFT</Th>
						<Th>Collection</Th>
						<Th>Token ID</Th>
						<Th>Actions</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					{#each $nftsForDisplay as nftData}
						{@const { nft, collectionInfo, tokenMetadata, isLoadingCollection, displayName } = nftData}
						<Tr>
							<Td>
								<div class="nft-info">
									<div class="nft-name">{displayName}</div>
									{#if tokenMetadata?.description}
										<div class="nft-description">{tokenMetadata.description}</div>
									{/if}
								</div>
							</Td>
							<Td>
								{#if isLoadingCollection}
									<Spinner size="16px" />
								{:else if collectionInfo}
									<div class="collection-info">
										<div class="collection-name">{collectionInfo.name}</div>
										<div class="collection-symbol">{collectionInfo.symbol}</div>
									</div>
								{:else}
									<span class="no-data">Unknown Collection</span>
								{/if}
							</Td>
							<Td>
								<span class="token-id">#{nft.token_id}</span>
							</Td>
							<Td>
								{#if tokenMetadata?.external_url}
									<Clickable onClick={() => selectNFT(tokenMetadata.external_url!)}>
										<Icon img="img/external-link.svg" alt="View" size="16px" />
									</Clickable>
								{/if}
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{/if}
</div>
