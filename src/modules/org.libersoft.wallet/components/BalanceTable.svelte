<script lang="ts">
	import { debug, isMobile } from '@/core/scripts/stores.ts';

	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import Tr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { dynamicEllipsis } from '@/core/actions/dynamicEllipsis';
	import { stringifyWithBigInt } from '@/core/scripts/utils/utils.js';
	import BalanceTableSpinner from '@/org.libersoft.wallet/components/BalanceTableSpinner.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import { getBalanceParts } from 'libersoft-crypto/balance';
	import CurrencyIcon from '@/org.libersoft.wallet/components/CurrencyIcon.svelte';
	import CurrencyNameAndSymbol from '@/org.libersoft.wallet/components/CurrencyNameAndSymbol.svelte';
	import type { IBalanceWithFiat } from 'libersoft-crypto';

	let { title, items } = $props();

	interface BalanceItem {
		iconURL: string | null | undefined;
		name: string | null | undefined;
		symbol: string | null | undefined;
		address: string | null | undefined;
		balanceData: IBalanceWithFiat | null | undefined;
		isLoadingName: boolean;
		isLoadingBalance: boolean;
		refreshFn: (() => void) | null | undefined;
		selectCurrency: () => void;
	}
</script>

<style>
	.balance {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}

	.balance .info {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.balance :where(.amount__value, .amount__symbol) {
		font-size: 18px;
		font-weight: bold;
	}

	.balance .amount {
		display: flex;
		align-items: center;
		gap: 5px;
		min-width: 0;
		flex: 1;
		max-width: fit-content;
	}

	.balance .amount__value {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.balance .amount__symbol {
		flex-shrink: 0;
	}

	.balance .fiat {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.balance .fiat-wrapper {
		width: 100%;
		flex-basis: 100%;
	}

	.balance-row {
		row-gap: 0;
	}

	.balance :where(.fiat__value, .fiat__symbol) {
		font-size: 13px;
	}

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

	:global(.ellipsis.ellipsis-token-balance) .td__text {
		flex: initial;
	}

	.spinner-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	@media (max-width: 768px) {
		.balance {
			padding-left: 50px;
		}

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
			<Th>{title}</Th>
			{#if !$isMobile}
				<Th>Balance</Th>
			{/if}
			<Th></Th>
		</TheadTr>
	</Thead>
	<Tbody>
		{#each items as item}
			{@render itemRow(item)}
		{/each}
	</Tbody>
</Table>

{#snippet itemRow(item: BalanceItem)}
	{@const { iconURL, name, symbol, address, balanceData, isLoadingName, isLoadingBalance, refreshFn, selectCurrency } = item}
	<Tr>
		<Td class={$isMobile ? 'ellipsis ellipsis-token-balance dynamic-ellipsis' : 'ellipsis ellipsis-balance dynamic-ellipsis'} use={dynamicEllipsis} useParams={{ minHeight: 20 }}>
			{#if $debug}
				<pre>{stringifyWithBigInt(balanceData)}</pre>
			{/if}
			<Clickable onClick={selectCurrency}>
				<div class={$isMobile ? 'item multi-row' : ''}>
					<div class="currency td__row">
						{#if isLoadingName}
							<BalanceTableSpinner />
						{:else}
							<CurrencyIcon {iconURL} symbol={name} />
							<CurrencyNameAndSymbol {name} {symbol} {address} />
						{/if}
					</div>
					{#if $isMobile}
						{@render balanceInfo(balanceData)}
					{/if}
				</div>
			</Clickable>
		</Td>
		{#if !$isMobile}
			<Td class="ellipsis ellipsis-token-balance dynamic-ellipsis" use={dynamicEllipsis} useParams={{ minHeight: 20 }}>
				{#if isLoadingBalance}
					<div class="spinner-wrapper">
						<BalanceTableSpinner />
					</div>
				{:else if balanceData}
					{@render balanceInfo(balanceData)}
				{:else}
					<div class="balance">
						<div class="info">
							<div class="amount">Cannot retrieve balance</div>
							<div class="fiat">(click refresh icon to retry)</div>
						</div>
					</div>
				{/if}
			</Td>
		{/if}
		<Td>
			{#if refreshFn}
				<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="16px" padding="5px" onClick={refreshFn} />
			{/if}
		</Td>
	</Tr>
{/snippet}

{#snippet balanceInfo(balanceData)}
	<div class="balance balance-row td__row">
		{#if balanceData?.crypto}
			{@const bp = getBalanceParts(balanceData.crypto)}
			<div class="amount">
				<span class="amount__value td__text">{bp.value}</span>
				<span class="amount__symbol td__icon">{bp.symbol}</span>
			</div>
		{:else}
			<BalanceTableSpinner />
		{/if}

		{#if balanceData?.fiat}
			{@const fp = getBalanceParts(balanceData.fiat, 2)}
			<div class="fiat-wrapper">
				<div class="fiat">
					<span class="fiat__value td__text">{fp.value}</span>
					<span class="fiat__symbol td__icon">{fp.symbol}</span>
				</div>
			</div>
		{/if}
		{#if $debug}
			{#if balanceData?.timestamp}
				<div class="fiat">Last update: {balanceData.timestamp.toLocaleTimeString()}</div>
			{/if}
			<!-- TODO - add countdown
			{#if countdown > 0}
				<div class="fiat">Refresh in: {countdown} s</div>
			{/if}
			-->
		{/if}
	</div>
{/snippet}
