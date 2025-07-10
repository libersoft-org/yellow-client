<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { selectedNetwork, selectedAddress, balance, balanceTimestamp, tokens } from '../scripts/wallet.ts';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import Tr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

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

	.name {
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
		<Table>
			<Tbody>
				<Tr>
					<Td expand>
						<div class="row">
							{#if $selectedNetwork?.currency?.iconURL}
								<Icon img={$selectedNetwork.currency.iconURL} alt={$balance.crypto.currency} size="40px" padding="0px" />
							{/if}
							<div class="name">{$balance.crypto.currency}</div>
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
				{#each $tokens as t, index}
					<Tr>
						<Td>
							<div class="row">
								<div>
									<Icon img={t.icon} alt={t.symbol} size="40px" padding="0px" />
								</div>
								<div class="name">{t.name} ({t.symbol})</div>
							</div>
						</Td>
						<Td>
							<div class="amount">? {t.symbol}</div>
							<div class="fiat">(? USD)</div>
						</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
