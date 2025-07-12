<script lang="ts">
	import { onMount } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { selectedNetwork, selectedAddress, balance, balanceTimestamp, tokens, getBalance, provider } from '../scripts/wallet.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import Tr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

	onMount(() => {
		if ($selectedNetwork && $selectedAddress && $provider) getBalance();
	});

	function selectCurrency() {
		console.log('SELECTED CURRENCY:', $selectedNetwork?.currency);
	}

	function selectToken(id) {
		console.log('SELECTED TOKEN:', id);
	}

	function refreshToken(tokenSymbol) {
		console.log('REFRESH TOKEN:', tokenSymbol);
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
		align-items: center;
		gap: 10px;
		padding: 10px;
	}

	.name {
		font-size: 20px;
		font-weight: bold;
	}

	.balance {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.balance .info {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	.balance .info .amount {
		font-size: 18px;
		font-weight: bold;
	}

	.balance .info .fiat {
		font-size: 12px;
	}
</style>

<div class="wallet-balance">
	{#if $selectedNetwork && $selectedAddress}
		<Table>
			<Tbody>
				<Tr>
					<Td padding="0" expand>
						<Clickable onClick={selectCurrency}>
							<div class="row">
								{#if $selectedNetwork?.currency?.iconURL}
									<Icon img={$selectedNetwork.currency.iconURL} alt={$balance.crypto.currency} size="40px" padding="0px" />
								{/if}
								<div class="name">{$balance.crypto.currency}</div>
							</div>
						</Clickable>
					</Td>
					<Td>
						<div class="balance">
							<div class="info">
								<div class="amount">{$balance.crypto.amount} {$balance.crypto.currency}</div>
								<div class="fiat">({$balance.fiat.amount} {$balance.fiat.currency})</div>
								{#if $debug}
									<div class="fiat">retrieved {$balanceTimestamp}</div>
								{/if}
							</div>
							<Icon img="img/reset.svg" alt="Refresh" size="16px" padding="5px" onClick={() => getBalance()} />
						</div>
					</Td>
				</Tr>
				{#each $tokens as t, index}
					<Tr>
						<Td padding="0" expand>
							<div class="row">
								<div>
									<Icon img={t.icon} alt={t.symbol} size="40px" padding="0px" />
								</div>
								<div class="name">{t.name} ({t.symbol})</div>
							</div>
						</Td>
						<Td>
							<div class="balance">
								<div class="info">
									<div class="amount">? {t.symbol}</div>
									<div class="fiat">(? USD)</div>
								</div>
								<Icon img="img/reset.svg" alt="Refresh" size="16px" padding="5px" onClick={() => refreshToken(t.symbol)} />
							</div>
						</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
