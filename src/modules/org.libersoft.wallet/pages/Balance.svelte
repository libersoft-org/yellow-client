<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { selectedNetwork, tokens } from '@/org.libersoft.wallet/scripts/network.ts';
	import { getBalance, getTokenBalance, getExchange, type IBalance } from '@/org.libersoft.wallet/scripts/balance.ts';
	import BalanceDisplay from '@/org.libersoft.wallet/components/BalanceDisplay.svelte';
	import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
	import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import Tr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	const refreshInterval = 30;
	interface IBalanceData {
		crypto: IBalance;
		fiat: IBalance | null;
		timestamp: Date;
	}
	interface ITokenBalanceData {
		symbol: string;
		crypto: IBalance;
		fiat: IBalance | null;
		timestamp: Date;
	}
	const tokenTimers = new Map<string, ReturnType<typeof setTimeout>>();
	const initializedTokens = new Set<string>();
	let balance = $state<IBalanceData | null>(null);
	let tokenBalances = $state(new Map<string, ITokenBalanceData>());
	let isLoadingBalance = $state(false);
	let loadingTokens = $state(new Set<string>());
	let balanceCountdown = $state(0);
	let tokenCountdowns = $state(new Map<string, number>());
	let countdownInterval: ReturnType<typeof setInterval> | null = null;
	let balanceTimer: ReturnType<typeof setTimeout> | null = null;

	function clearAllTimers() {
		tokenTimers.forEach(timer => clearTimeout(timer));
		tokenTimers.clear();
		if (balanceTimer) clearTimeout(balanceTimer);
		initializedTokens.clear();
		balance = null;
		tokenBalances.clear();
	}

	function initializeAllBalances() {
		if ($selectedNetwork && $selectedAddress && $provider) {
			refreshBalance();
			if ($tokens && $tokens.length > 0) {
				$tokens.forEach((token, index) => setTimeout(() => refreshToken(token.symbol), index * 500)); // Increased delay to 500ms between tokens
			}
		}
	}

	onMount(() => {
		initializeAllBalances();
		countdownInterval = setInterval(updateCountdowns, 1000);
	});

	onDestroy(() => {
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
		tokenCountdowns = new Map(tokenCountdowns); // Force reactivity for Map
	}

	function selectCurrency() {
		console.log('SELECTED CURRENCY:', $selectedNetwork?.currency);
	}

	function selectToken(id: string) {
		console.log('SELECTED TOKEN:', id);
	}

	async function refreshToken(tokenSymbol: string) {
		console.log('REFRESH TOKEN:', tokenSymbol);
		if (loadingTokens.has(tokenSymbol)) {
			console.log('Token already being refreshed:', tokenSymbol);
			return;
		}
		if (tokenTimers.has(tokenSymbol)) {
			clearTimeout(tokenTimers.get(tokenSymbol));
			tokenTimers.delete(tokenSymbol);
		}
		tokenCountdowns.set(tokenSymbol, 0);
		loadingTokens.add(tokenSymbol);
		loadingTokens = new Set(loadingTokens); // Force reactivity
		try {
			const tokenBalance = await getTokenBalance(tokenSymbol);
			if (tokenBalance) {
				const fiatBalance = await getExchange(tokenBalance, 'USD');
				const tokenData: ITokenBalanceData = {
					symbol: tokenSymbol,
					crypto: tokenBalance,
					fiat: fiatBalance,
					timestamp: new Date(),
				};
				tokenBalances.set(tokenSymbol, tokenData);
				tokenBalances = new Map(tokenBalances); // Force reactivity
			}
		} finally {
			loadingTokens.delete(tokenSymbol);
			loadingTokens = new Set(loadingTokens); // Force reactivity
			const timer = setTimeout(() => refreshToken(tokenSymbol), refreshInterval * 1000);
			tokenTimers.set(tokenSymbol, timer);
			tokenCountdowns.set(tokenSymbol, refreshInterval);
		}
	}

	async function refreshBalance() {
		if (balanceTimer) clearTimeout(balanceTimer);
		balanceCountdown = 0;
		isLoadingBalance = true;
		try {
			const nativeBalance = await getBalance();
			if (nativeBalance) {
				const fiatBalance = await getExchange(nativeBalance, 'USD');
				balance = {
					crypto: nativeBalance,
					fiat: fiatBalance,
					timestamp: new Date(),
				};
			}
		} finally {
			isLoadingBalance = false;
			balanceTimer = setTimeout(refreshBalance, refreshInterval * 1000);
			balanceCountdown = refreshInterval;
		}
	}

	// Watch for new tokens being added and initialize them
	$effect(() => {
		if ($tokens && $tokens.length > 0) {
			$tokens.forEach((token, index) => {
				if (!initializedTokens.has(token.symbol)) {
					initializedTokens.add(token.symbol);
					if ($selectedNetwork && $selectedAddress && $provider) setTimeout(() => refreshToken(token.symbol), 500 + index * 200);
				}
			});
		}
	});
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
								<div class="name">{$selectedNetwork.currency.symbol || '?'}</div>
							</div>
						</Clickable>
					</Td>
					<Td>
						{#if isLoadingBalance}
							<Spinner size="16px" />
						{:else}
							<div class="balance">
								<div class="info">
									<div class="amount"><BalanceDisplay balance={balance?.crypto} /></div>
									<div class="fiat">(<BalanceDisplay balance={balance?.fiat} roundToDecimals={2} />)</div>
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
										<div class="amount"><BalanceDisplay balance={tokenBalance?.crypto} showCurrency={false} /> {t.symbol}</div>
										<div class="fiat">(<BalanceDisplay balance={tokenBalance?.fiat} roundToDecimals={2} />)</div>
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
