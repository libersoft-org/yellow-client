<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { selectedNetwork, tokens } from '@/org.libersoft.wallet/scripts/network.ts';
	import { getBalance, getTokenBalance, getExchange, type IBalance } from '@/org.libersoft.wallet/scripts/balance.ts';
	import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
	import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import Tr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	interface IBalanceData {
		crypto: IBalance;
		fiat: IBalance;
		timestamp: Date;
	}
	interface ITokenBalanceData {
		symbol: string;
		crypto: IBalance;
		fiat: IBalance;
		timestamp: Date;
	}
	const tokenTimers = new Map<string, NodeJS.Timeout>();
	const initializedTokens = new Set<string>();
	let balance: IBalanceData | null = null;
	let tokenBalances = new Map<string, ITokenBalanceData>();
	let isLoadingBalance = false;
	let loadingTokens = new Set<string>();
	let balanceCountdown = 0;
	let tokenCountdowns = new Map<string, number>();
	let countdownInterval: NodeJS.Timeout;
	let balanceTimer: NodeJS.Timeout;

	onMount(() => {
		if ($selectedNetwork && $selectedAddress && $provider) {
			refreshBalance();
			// Initialize tokens individually with delays
			if ($tokens && $tokens.length > 0) {
				$tokens.forEach((token, index) => {
					// Add small delay between token loads to avoid all at once
					setTimeout(() => {
						refreshToken(token.symbol);
					}, index * 100);
				});
			}
		}
		// Start countdown update interval
		countdownInterval = setInterval(updateCountdowns, 1000);
	});

	onDestroy(() => {
		// Clear all timers when component is destroyed
		tokenTimers.forEach(timer => clearTimeout(timer));
		tokenTimers.clear();
		if (countdownInterval) clearInterval(countdownInterval);
		if (balanceTimer) clearTimeout(balanceTimer);
	});

	function updateCountdowns() {
		if (balanceCountdown > 0) balanceCountdown--;
		tokenCountdowns.forEach((countdown, symbol) => {
			if (countdown > 0) tokenCountdowns.set(symbol, countdown - 1);
		});
		// Trigger reactivity
		tokenCountdowns = tokenCountdowns;
	}

	function selectCurrency() {
		console.log('SELECTED CURRENCY:', $selectedNetwork?.currency);
	}

	function selectToken(id) {
		console.log('SELECTED TOKEN:', id);
	}

	async function refreshToken(tokenSymbol: string) {
		console.log('REFRESH TOKEN:', tokenSymbol);
		// Clear existing timer for this token
		if (tokenTimers.has(tokenSymbol)) {
			clearTimeout(tokenTimers.get(tokenSymbol));
			tokenTimers.delete(tokenSymbol);
		}
		// Reset countdown while refreshing
		tokenCountdowns.set(tokenSymbol, 0);
		loadingTokens.add(tokenSymbol);
		loadingTokens = loadingTokens; // trigger reactivity

		try {
			// Get token balance
			const tokenBalance = await getTokenBalance(tokenSymbol);
			if (tokenBalance) {
				// Get fiat conversion
				const fiatBalance = await getExchange(tokenBalance.amount, tokenBalance.currency, 'USD');

				const tokenData: ITokenBalanceData = {
					symbol: tokenSymbol,
					crypto: tokenBalance,
					fiat: fiatBalance || { amount: '?', currency: 'USD' },
					timestamp: new Date(),
				};

				tokenBalances.set(tokenSymbol, tokenData);
				tokenBalances = tokenBalances; // trigger reactivity
			}
		} finally {
			loadingTokens.delete(tokenSymbol);
			loadingTokens = loadingTokens; // trigger reactivity

			// Start 30-second timer for this specific token
			const timer = setTimeout(() => refreshToken(tokenSymbol), 30000);
			tokenTimers.set(tokenSymbol, timer);
			// Start countdown after data is received
			tokenCountdowns.set(tokenSymbol, 30);
		}
	}

	async function refreshBalance() {
		// Clear existing timer
		if (balanceTimer) clearTimeout(balanceTimer);
		// Reset countdown while refreshing
		balanceCountdown = 0;
		isLoadingBalance = true;

		try {
			// Get native balance
			const nativeBalance = await getBalance();
			if (nativeBalance) {
				// Get fiat conversion
				const fiatBalance = await getExchange(nativeBalance.amount, nativeBalance.currency, 'USD');

				balance = {
					crypto: nativeBalance,
					fiat: fiatBalance || { amount: '?', currency: 'USD' },
					timestamp: new Date(),
				};
			}
		} finally {
			isLoadingBalance = false;

			// Start 30-second timer for balance
			balanceTimer = setTimeout(refreshBalance, 30000);
			// Start countdown after data is received
			balanceCountdown = 30;
		}
	}

	// Watch for new tokens being added and initialize them
	$: if ($tokens && $tokens.length > 0) {
		$tokens.forEach(token => {
			if (!initializedTokens.has(token.symbol)) {
				initializedTokens.add(token.symbol);
				// Only auto-load if we have network and address ready
				if ($selectedNetwork && $selectedAddress && $provider) {
					setTimeout(() => refreshToken(token.symbol), 100);
				}
			}
		});
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
									<Icon img={$selectedNetwork.currency.iconURL} alt={balance?.crypto.currency || '?'} size="40px" padding="0px" />
								{/if}
								<div class="name">{balance?.crypto.currency || '?'}</div>
							</div>
						</Clickable>
					</Td>
					<Td>
						{#if isLoadingBalance}
							<Spinner size="16px" />
						{:else}
							<div class="balance">
								<div class="info">
									<div class="amount">{balance?.crypto.amount || '?'} {balance?.crypto.currency || ''}</div>
									<div class="fiat">({balance?.fiat.amount || '?'} {balance?.fiat.currency || '?'})</div>
									{#if $debug}
										<div class="fiat">retrieved {balance?.timestamp.toLocaleTimeString() || '?'}</div>
										<div class="fiat">Refresh in: {balanceCountdown} s</div>
									{/if}
								</div>
								<Icon img="img/reset.svg" alt="Refresh" size="16px" padding="5px" onClick={refreshBalance} />
							</div>
						{/if}
					</Td>
				</Tr>
				{#each $tokens as t, index}
					{@const tokenBalance = tokenBalances.get(t.symbol)}
					<Tr>
						<Td padding="0" expand>
							<Clickable onClick={() => selectToken(t.symbol)}>
								<div class="row">
									<div>
										<Icon img={t.icon} alt={t.symbol} size="40px" padding="0px" />
									</div>
									<div class="name">{t.name} ({t.symbol})</div>
								</div>
							</Clickable>
						</Td>
						<Td>
							{#if loadingTokens.has(t.symbol)}
								<Spinner size="16px" />
							{:else}
								<div class="balance">
									<div class="info">
										<div class="amount">{tokenBalance?.crypto.amount || '?'} {t.symbol}</div>
										<div class="fiat">({tokenBalance?.fiat.amount || '?'} {tokenBalance?.fiat.currency || '?'})</div>
										{#if $debug}
											<div class="fiat">Refresh in: {tokenCountdowns.get(t.symbol) || 0} s</div>
										{/if}
									</div>
									<Icon img="img/reset.svg" alt="Refresh" size="16px" padding="5px" onClick={() => refreshToken(t.symbol)} />
								</div>
							{/if}
						</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
