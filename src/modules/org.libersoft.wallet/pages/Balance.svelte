<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { selectedNetwork, tokens } from '@/org.libersoft.wallet/scripts/network.ts';
	import { getBalance, getTokenBalance, getExchange, getTokenInfo, type IBalance } from '@/org.libersoft.wallet/scripts/balance.ts';
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
		crypto: IBalance;
		fiat: IBalance | null;
		timestamp: Date;
	}
	interface ITokenInfo {
		symbol: string;
		name: string;
	}
	const tokenTimers = new Map<string, ReturnType<typeof setTimeout>>();
	const initializedTokens = new Set<string>();
	let balance = $state<IBalanceData | null>(null);
	let tokenBalances = $state(new Map<string, ITokenBalanceData>());
	let tokenInfos = $state(new Map<string, ITokenInfo>()); // Oddělené ukládání názvů a symbolů
	let isLoadingBalance = $state(false);
	let loadingTokens = $state(new Set<string>());
	let loadingTokenInfos = $state(new Set<string>()); // Loading stav pro názvy tokenů
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
		tokenBalances = new Map(tokenBalances); // Force reactivity
		tokenInfos.clear();
		tokenInfos = new Map(tokenInfos); // Force reactivity
		loadingTokenInfos.clear();
		loadingTokenInfos = new Set(loadingTokenInfos); // Force reactivity
	}

	function initializeAllBalances() {
		if ($selectedNetwork && $selectedAddress && $provider) {
			refreshBalance();
			if ($tokens && $tokens.length > 0) {
				// Nejprve načteme informace o všech tokenech (názvy a symboly)
				$tokens.forEach((token, index) => {
					setTimeout(() => loadTokenInfo(token.symbol), index * 100); // Rychlejší načítání info
				});
				// Poté načteme balance s větším zpožděním
				$tokens.forEach((token, index) => setTimeout(() => refreshToken(token.symbol), 500 + index * 500));
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

	async function loadTokenInfo(tokenSymbol: string) {
		// Pokud už máme informace o tokenu, nemusíme je načítat znovu
		if (tokenInfos.has(tokenSymbol) || loadingTokenInfos.has(tokenSymbol)) {
			return;
		}

		loadingTokenInfos.add(tokenSymbol);
		loadingTokenInfos = new Set(loadingTokenInfos); // Force reactivity

		try {
			const token = $tokens.find(t => t.symbol === tokenSymbol);
			let tokenInfo: ITokenInfo = {
				symbol: tokenSymbol,
				name: tokenSymbol, // Fallback
			};

			// Načteme název a symbol ze smart contractu (pouze jednou)
			if (token?.contract_address) {
				try {
					const contractInfo = await getTokenInfo(token.contract_address);
					if (contractInfo) {
						tokenInfo.name = contractInfo.name;
						tokenInfo.symbol = contractInfo.symbol;
					}
				} catch (error) {
					console.warn('Failed to get token info from smart contract, using fallback:', error);
				}
			}

			tokenInfos.set(tokenSymbol, tokenInfo);
			tokenInfos = new Map(tokenInfos); // Force reactivity
		} finally {
			loadingTokenInfos.delete(tokenSymbol);
			loadingTokenInfos = new Set(loadingTokenInfos); // Force reactivity
		}
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

		// Načteme informace o tokenu pokud je ještě nemáme
		if (!tokenInfos.has(tokenSymbol)) {
			await loadTokenInfo(tokenSymbol);
		}

		try {
			const tokenBalance = await getTokenBalance(tokenSymbol);
			if (tokenBalance) {
				const fiatBalance = await getExchange(tokenBalance, 'USD');

				const tokenData: ITokenBalanceData = {
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
					if ($selectedNetwork && $selectedAddress && $provider) {
						// Nejprve načteme info o tokenu, pak balance
						setTimeout(() => loadTokenInfo(token.symbol), index * 100);
						setTimeout(() => refreshToken(token.symbol), 500 + index * 200);
					}
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
					{@const tokenInfo = tokenInfos.get(t.symbol)}
					{@const isLoadingInfo = loadingTokenInfos.has(t.symbol)}
					{@const isLoadingBalance = loadingTokens.has(t.symbol)}

					{#if tokenInfo && (tokenBalance || isLoadingBalance)}
						<Tr>
							<Td padding="0" expand>
								<Clickable onClick={() => selectToken(t.symbol)}>
									<div class="row">
										<div>
											<Icon img={t.iconURL} alt={tokenInfo.symbol} size="40px" padding="0px" />
										</div>
										<div class="name">{tokenInfo.name} ({tokenInfo.symbol})</div>
									</div>
								</Clickable>
							</Td>
							<Td>
								{#if isLoadingBalance}
									<Spinner size="16px" />
								{:else if tokenBalance}
									<div class="balance">
										<div class="info">
											<div class="amount"><BalanceDisplay balance={tokenBalance.crypto} showCurrency={false} /> {tokenInfo.symbol}</div>
											<div class="fiat">(<BalanceDisplay balance={tokenBalance.fiat} roundToDecimals={2} />)</div>
											{#if $debug}
												<div class="fiat">Refresh in: {tokenCountdowns.get(t.symbol) || 0} s</div>
											{/if}
										</div>
										<Icon img="img/reset.svg" alt="Refresh" size="16px" padding="5px" onClick={() => refreshToken(t.symbol)} />
									</div>
								{/if}
							</Td>
						</Tr>
					{:else if isLoadingInfo}
						<Tr>
							<Td padding="0" expand>
								<div class="row">
									<div>
										<Icon img={t.iconURL} alt={t.symbol} size="40px" padding="0px" />
									</div>
									<div class="name"><Spinner size="16px" /></div>
								</div>
							</Td>
							<Td>
								<Spinner size="16px" />
							</Td>
						</Tr>
					{/if}
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
