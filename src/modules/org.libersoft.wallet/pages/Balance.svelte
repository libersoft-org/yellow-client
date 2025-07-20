<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { selectedNetwork, tokens } from '@/org.libersoft.wallet/scripts/network.ts';
	import { getBalance, getTokenBalanceByAddress, getExchange, getTokenInfo, getBatchTokensInfo, getBatchTokenBalancesByAddresses, type IBalance } from '@/org.libersoft.wallet/scripts/balance.ts';
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
	interface ITokenData {
		crypto: IBalance;
		fiat: IBalance | null;
		timestamp: Date;
	}
	interface ITokenInfo {
		symbol: string;
		name: string;
	}
	let balance = $state<ITokenData | null>(null);
	let tokenBalances = $state(new Map<string, ITokenData>());
	let tokenInfos = $state(new Map<string, ITokenInfo>());
	let isLoadingBalance = $state(false);
	let loadingTokens = $state(new Set<string>());
	let loadingTokenInfos = $state(new Set<string>());
	let balanceCountdown = $state(0);
	let tokenCountdowns = $state(new Map<string, number>());
	const tokenTimers = new Map<string, ReturnType<typeof setTimeout>>();
	const initializedTokens = new Set<string>();
	let countdownInterval: ReturnType<typeof setInterval> | null = null;
	let balanceTimer: ReturnType<typeof setTimeout> | null = null;

	// Helper functions
	function updateReactiveMap<T>(map: Map<string, T>, updater: (map: Map<string, T>) => void): Map<string, T> {
		updater(map);
		return new Map(map);
	}

	function updateReactiveSet<T>(set: Set<T>, updater: (set: Set<T>) => void): Set<T> {
		updater(set);
		return new Set(set);
	}

	function getTokensWithContracts() {
		return $tokens.filter(token => token.contract_address);
	}

	function clearAllTimers() {
		tokenTimers.forEach(timer => clearTimeout(timer));
		tokenTimers.clear();
		if (balanceTimer) clearTimeout(balanceTimer);
		if (countdownInterval) clearInterval(countdownInterval);
		initializedTokens.clear();
		balance = null;
		tokenBalances.clear();
		tokenInfos.clear();
		loadingTokenInfos.clear();
	}

	function initializeAllBalances() {
		if ($selectedNetwork && $selectedAddress && $provider) {
			refreshBalance();
			if ($tokens?.length) {
				loadAllTokensInfo();
				loadAllTokenBalances();
			}
		}
	}

	function updateCountdowns() {
		if (balanceCountdown > 0) balanceCountdown--;
		tokenCountdowns = updateReactiveMap(tokenCountdowns, map => {
			map.forEach((countdown, contractAddress) => {
				if (countdown > 0) map.set(contractAddress, countdown - 1);
			});
		});
	}

	// Lifecycle
	onMount(() => {
		initializeAllBalances();
		countdownInterval = setInterval(updateCountdowns, 1000);
	});

	onDestroy(() => {
		clearAllTimers();
	});

	// Event handlers
	function selectCurrency() {
		console.log('SELECTED CURRENCY:', $selectedNetwork?.currency);
	}

	function selectToken(contractAddress: string) {
		console.log('SELECTED TOKEN:', contractAddress);
	}

	async function loadTokenInfo(contractAddress: string) {
		if (tokenInfos.has(contractAddress) || loadingTokenInfos.has(contractAddress)) return;
		loadingTokenInfos = updateReactiveSet(loadingTokenInfos, set => set.add(contractAddress));
		try {
			let tokenInfo: ITokenInfo = {
				symbol: 'UNKNOWN',
				name: 'Unknown token',
			};
			if (contractAddress) {
				try {
					const contractInfo = await getTokenInfo(contractAddress);
					if (contractInfo && contractInfo.name && contractInfo.symbol) {
						tokenInfo = { name: contractInfo.name, symbol: contractInfo.symbol };
					}
				} catch (error) {
					console.warn('Failed to get token info from smart contract, using fallback:', error);
				}
			}
			tokenInfos = updateReactiveMap(tokenInfos, map => map.set(contractAddress, tokenInfo));
		} finally {
			loadingTokenInfos = updateReactiveSet(loadingTokenInfos, set => set.delete(contractAddress));
		}
	}

	async function loadAllTokensInfo() {
		const tokensToLoad = getTokensWithContracts().filter(token => token.contract_address && !tokenInfos.has(token.contract_address) && !loadingTokenInfos.has(token.contract_address));
		if (!tokensToLoad.length) return;
		// Mark all as loading
		loadingTokenInfos = updateReactiveSet(loadingTokenInfos, set => {
			tokensToLoad.forEach(token => token.contract_address && set.add(token.contract_address));
		});
		try {
			const contractAddresses = tokensToLoad.map(token => token.contract_address!);
			// Use batch multicall to load all tokens at once
			const batchResults = await getBatchTokensInfo(contractAddresses);
			// Save results
			tokenInfos = updateReactiveMap(tokenInfos, map => {
				batchResults.forEach((tokenInfo, contractAddress) => {
					map.set(contractAddress, { symbol: tokenInfo.symbol, name: tokenInfo.name });
				});
				// Fallback for failed tokens
				tokensToLoad.forEach(token => {
					if (token.contract_address && !map.has(token.contract_address)) {
						map.set(token.contract_address, { symbol: 'UNKNOWN', name: 'Unknown token' });
					}
				});
			});
		} catch (error) {
			console.error('Error in batch token info loading:', error);
			// Fallback for all tokens
			tokenInfos = updateReactiveMap(tokenInfos, map => {
				tokensToLoad.forEach(token => {
					if (token.contract_address && !map.has(token.contract_address)) {
						map.set(token.contract_address, { symbol: 'UNKNOWN', name: 'Unknown token' });
					}
				});
			});
		} finally {
			// Mark all as completed
			loadingTokenInfos = updateReactiveSet(loadingTokenInfos, set => {
				tokensToLoad.forEach(token => token.contract_address && set.delete(token.contract_address));
			});
		}
	}

	async function loadAllTokenBalances() {
		const tokensWithContracts = getTokensWithContracts().filter(token => token.contract_address && !loadingTokens.has(token.contract_address));
		if (!tokensWithContracts.length) return;

		// Mark all as loading
		loadingTokens = updateReactiveSet(loadingTokens, set => {
			tokensWithContracts.forEach(token => token.contract_address && set.add(token.contract_address));
		});

		try {
			const contractAddresses = tokensWithContracts.map(token => token.contract_address!);
			// Use batch multicall to load all token balances at once
			const batchBalances = await getBatchTokenBalancesByAddresses(contractAddresses);

			// Process results and get fiat rates
			const fiatResults = await Promise.all(
				Array.from(batchBalances.entries()).map(async ([contractAddress, balance]) => {
					try {
						if (balance) {
							const fiatBalance = await getExchange(balance, 'USD');
							return { contractAddress, balance, fiatBalance };
						}
						return null;
					} catch (error) {
						console.warn(`Error getting fiat rate for ${contractAddress}:`, error);
						return null;
					}
				})
			);

			// Save results
			tokenBalances = updateReactiveMap(tokenBalances, map => {
				fiatResults.forEach(result => {
					if (result?.contractAddress && result.balance) {
						map.set(result.contractAddress, {
							crypto: result.balance,
							fiat: result.fiatBalance,
							timestamp: new Date(),
						});
					}
				});
			});

			// Set up refresh timers
			tokensWithContracts.forEach(token => {
				if (token.contract_address) {
					const timer = setTimeout(() => refreshToken(token.contract_address!), refreshInterval * 1000);
					tokenTimers.set(token.contract_address, timer);
					tokenCountdowns.set(token.contract_address, refreshInterval);
				}
			});
		} catch (error) {
			console.error('Error in batch token balance loading:', error);
		} finally {
			// Mark all as completed
			loadingTokens = updateReactiveSet(loadingTokens, set => {
				tokensWithContracts.forEach(token => token.contract_address && set.delete(token.contract_address));
			});
		}
	}

	async function refreshToken(contractAddress: string) {
		if (loadingTokens.has(contractAddress)) {
			console.log('Token already being refreshed:', contractAddress);
			return;
		}
		// Clear existing timer
		if (tokenTimers.has(contractAddress)) {
			clearTimeout(tokenTimers.get(contractAddress));
			tokenTimers.delete(contractAddress);
		}
		tokenCountdowns.set(contractAddress, 0);
		loadingTokens = updateReactiveSet(loadingTokens, set => set.add(contractAddress));
		// Load token information if needed
		if (!tokenInfos.has(contractAddress)) await loadTokenInfo(contractAddress);
		try {
			const tokenBalance = await getTokenBalanceByAddress(contractAddress);
			if (tokenBalance) {
				const fiatBalance = await getExchange(tokenBalance, 'USD');
				tokenBalances = updateReactiveMap(tokenBalances, map => {
					map.set(contractAddress, {
						crypto: tokenBalance,
						fiat: fiatBalance,
						timestamp: new Date(),
					});
				});
			}
		} finally {
			loadingTokens = updateReactiveSet(loadingTokens, set => set.delete(contractAddress));
			// Schedule next refresh
			const timer = setTimeout(() => refreshToken(contractAddress), refreshInterval * 1000);
			tokenTimers.set(contractAddress, timer);
			tokenCountdowns.set(contractAddress, refreshInterval);
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
		if (!$tokens?.length || !$selectedNetwork || !$selectedAddress || !$provider) return;
		const newTokens = getTokensWithContracts().filter(token => token.contract_address && !initializedTokens.has(token.contract_address));
		if (newTokens.length > 0) {
			// Mark as initialized
			newTokens.forEach(token => {
				if (token.contract_address) initializedTokens.add(token.contract_address);
			});
			// Load info and balances for new tokens
			loadAllTokensInfo();
			loadAllTokenBalances();
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

	.column {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.name {
		font-size: 20px;
		font-weight: bold;
	}

	.address {
		font-size: 12px;
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
				{#each $tokens as token, index}
					{@const { contract_address } = token}
					{@const tokenBalance = contract_address ? tokenBalances.get(contract_address) : null}
					{@const tokenInfo = contract_address ? tokenInfos.get(contract_address) : null}
					{@const isLoadingInfo = contract_address ? loadingTokenInfos.has(contract_address) : false}
					{@const isLoadingBalance = contract_address ? loadingTokens.has(contract_address) : false}
					{@const displayName = tokenInfo && tokenInfo.symbol !== 'UNKNOWN' ? `${tokenInfo.name} (${tokenInfo.symbol})` : tokenInfo?.name || `Token (${contract_address?.slice(0, 10)}...)`}
					{@const displaySymbol = tokenInfo && tokenInfo.symbol !== 'UNKNOWN' ? tokenInfo.symbol : 'UNKNOWN'}
					{#if contract_address}
						<Tr>
							<Td padding="0" expand>
								<Clickable onClick={() => selectToken(contract_address)}>
									<div class="row">
										<Icon img={token.iconURL} alt={displaySymbol} size="40px" padding="0px" />
										<div class="column">
											<div class="name">
												{#if isLoadingInfo}
													<Spinner size="16px" />
												{:else}
													{displayName}
												{/if}
											</div>
											{#if $debug || !tokenInfo || tokenInfo.symbol === 'UNKNOWN'}
												<div class="address">{contract_address}</div>
											{/if}
										</div>
									</div>
								</Clickable>
							</Td>
							<Td>
								{#if isLoadingBalance}
									<Spinner size="16px" />
								{:else if tokenBalance}
									<div class="balance">
										<div class="info">
											<div class="amount">
												<BalanceDisplay balance={tokenBalance.crypto} showCurrency={false} />
												{displaySymbol}
											</div>
											<div class="fiat">(<BalanceDisplay balance={tokenBalance.fiat} roundToDecimals={2} />)</div>
											{#if $debug}
												<div class="fiat">Refresh in: {tokenCountdowns.get(contract_address) || 0} s</div>
											{/if}
										</div>
										<Icon img="img/reset.svg" alt="Refresh" size="16px" padding="5px" onClick={() => refreshToken(contract_address)} />
									</div>
								{:else}
									<div class="balance">
										<div class="info">
											<div class="amount">Failed to load</div>
											<div class="fiat">(click refresh to retry)</div>
										</div>
										<Icon img="img/reset.svg" alt="Retry" size="16px" padding="5px" onClick={() => refreshToken(contract_address)} />
									</div>
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td padding="0" expand>
								<Clickable onClick={() => selectToken('')}>
									<div class="row">
										<Icon img={token.iconURL} alt="Unknown token" size="40px" padding="0px" />
										<div class="name">Unknown token (no contract address)</div>
									</div>
								</Clickable>
							</Td>
							<Td>
								<div class="balance">
									<div class="info">
										<div class="amount">N/A</div>
										<div class="fiat">(No contract address)</div>
									</div>
								</div>
							</Td>
						</Tr>
					{/if}
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
