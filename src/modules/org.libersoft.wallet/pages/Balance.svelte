<script>
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import Tr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	let tokens = [
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

<Table breakpoint="0px">
	<Tbody>
		{#each tokens as t, index}
			<Tr>
				<Td>
					<div class="row">
						<div><Icon img={t.icon} size="40px" padding="0px" alt={t.symbol} /></div>
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

<!--
<script>
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	export let icon;
	export let symbol;
	export let amount;
	export let className = '';
	export let onClick;
</script>

<style>
	.item .symbol {
		flex-grow: 1;
		font-size: 20px;
		font-weight: bold;
	}

	.item .amount {
		text-align: right;
	}

	.item .amount .crypto {
		font-weight: bold;
		font-size: 18px;
	}

	.item .amount .fiat {
		font-size: 14px;
		color: #555;
	}
</style>

<Clickable {onClick}>
	<div class="item {className}">
		{#if icon}
			<div class="icon"><img src={icon} alt={symbol} /></div>
		{/if}
		<div class="symbol">{symbol}</div>
		<div class="amount">
			<div class="crypto">{amount.crypto} {symbol}</div>
			<div class="fiat">({amount.fiat} USD)</div>
		</div>
	</div>
</Clickable>
-->
