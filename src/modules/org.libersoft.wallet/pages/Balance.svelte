<script lang="ts">
	import { debug } from '@/core/stores.ts';
	import { selectedNetwork, selectedAddress, balance, balanceTimestamp } from '../wallet.ts';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import Tr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Token {
		icon: string;
		symbol: string;
		amount: {
			crypto: number;
			fiat: number;
		};
	}
	let tokens: Token[] = [
		{
			icon: 'https://raw.githubusercontent.com/libersoft-org/blockchain-icons/refs/heads/main/tokens/DAI.svg',
			symbol: 'DAI',
			amount: {
				crypto: 105,
				fiat: 104.98,
			},
		},
		{
			icon: 'https://raw.githubusercontent.com/libersoft-org/blockchain-icons/refs/heads/main/tokens/DOT.svg',
			symbol: 'DOT',
			amount: {
				crypto: 13.58468432,
				fiat: 815.23,
			},
		},
	];

	function selectToken(id) {
		console.log('SELECTED TOKEN:', id);
	}
</script>

<style>
	.wallet-balance {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.row {
		display: flex;
		gap: 10px;
	}

	.symbol {
		font-size: 20px;
		font-weight: bold;
	}

	.amount {
		font-size: 18px;
		font-weight: bold;
	}

	.fiat {
		font-size: 12px;
	}
</style>

<div class="wallet-balance">
	{#if $selectedNetwork && $selectedAddress}
		<Table breakpoint="0px">
			<Tbody>
				{#if $selectedNetwork?.currency?.iconURL}
					<Tr>
						<Td>
							<div class="row">
								<Icon img={$selectedNetwork.currency.iconURL} alt={$balance.crypto.currency} size="40px" padding="0px" />
								<div class="symbol">{$balance.crypto.currency}</div>
							</div>
						</Td>
						<Td>
							<div class="amount">{$balance.crypto.amount} {$balance.crypto.currency}</div>
							<div class="fiat">({$balance.fiat.amount} {$balance.fiat.currency})</div>
							{#if $debug}
								<div class="fiat">retrieved {$balanceTimestamp}</div>
							{/if}
						</Td>
					</Tr>
				{/if}
				{#each tokens as t, index}
					<Tr>
						<Td>
							<div class="row">
								<div><Icon img={t.icon} alt={t.symbol} size="40px" padding="0px" /></div>
								<div class="symbol">{t.symbol}</div>
							</div>
						</Td>
						<Td>
							<div class="amount">{t.amount.crypto} {t.symbol}</div>
							<div class="fiat">({t.amount.fiat} USD)</div>
						</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
