<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { debug, isMobile } from '@/core/scripts/stores.ts';
	import { stringifyWithBigInt } from '@/core/scripts/utils/utils.ts';
	import { selectedNetwork, tokens, nfts } from '@/org.libersoft.wallet/scripts/network.ts';
	import { getBalance, getTokenBalanceByAddress, getExchange, getTokenInfo, getBatchTokensInfo, getBatchTokenBalancesByAddresses, getNFTsFromConfiguredContracts, formatBalance, type IBalance, type INFTItem } from '@/org.libersoft.wallet/scripts/balance.ts';
	import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
	import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
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
	let nftContractInfos = $state(new Map<string, { name: string; collection: string; balance: number; loading: boolean }>());
	let isLoadingBalance = $state(false);
	let loadingTokens = $state(new Set<string>());
	let loadingTokenInfos = $state(new Set<string>());
	let balanceCountdown = $state(0);
	let tokenCountdowns = $state(new Map<string, number>());
	const tokenTimers = new Map<string, ReturnType<typeof setTimeout>>();
	const initializedTokens = new Set<string>();
	let countdownInterval: ReturnType<typeof setInterval> | null = null;
	let balanceTimer: ReturnType<typeof setTimeout> | null = null;
	let lastNFTsLength = $state(0);
	let lastTokensLength = $state(0);

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
		nftContractInfos.clear();
		lastNFTsLength = 0;
		lastTokensLength = 0;
	}

	function initializeAllBalances() {
		if ($selectedNetwork && $selectedAddress && $provider) {
			refreshBalance();
			loadNFTContractInfos();
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
		console.log('😊😊😊😊😊😊😊😊😊', formatBalance({ amount: -99999999999999999999999999999999999999999123456789123456789n, decimals: 18, currency: 'ETH' }));
		console.log('😊😊😊😊😊😊😊😊😊', formatBalance({ amount: -1000n, decimals: 18, currency: 'ETH' }));
		console.log('😊😊😊😊😊😊😊😊😊', formatBalance({ amount: 123456789123456789n, decimals: 0, currency: 'ETH' }, 6));
		console.log('😊😊😊😊😊😊😊😊😊', formatBalance({ amount: 0n, decimals: 18, currency: 'ETH' }, 6));
		console.log('😊😊😊😊😊😊😊😊😊', formatBalance({ amount: 123456789123456789123456789123456789123456789123456789n, decimals: 40, currency: 'ETH' }, 2));
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

	function selectNFT(url: string) {
		console.log('SELECTED NFT:', url);
		window.open(url, '_blank');
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

	async function loadNFTContractInfos() {
		// Load info for all configured NFT contracts
		if (!$nfts || $nfts.length === 0) return;

		console.log('Loading NFT contract infos for', $nfts.length, 'contracts');

		// Set loading state for all contracts first
		$nfts.forEach(nft => {
			if (!nft.contract_address) return;
			nftContractInfos = updateReactiveMap(nftContractInfos, map => {
				map.set(nft.contract_address, {
					name: 'Loading...',
					collection: 'Loading...',
					balance: 0,
					loading: true,
				});
			});
		});

		try {
			// Load all NFTs from configured contracts at once
			const allNFTItems = await getNFTsFromConfiguredContracts();
			console.log('Loaded all NFT items:', allNFTItems.length);

			// Process results for each configured contract
			$nfts.forEach(nft => {
				if (!nft.contract_address) return;

				const contractNFTs = allNFTItems.filter(item => item.contract_address === nft.contract_address);

				if (contractNFTs.length > 0) {
					const firstNFT = contractNFTs[0];
					nftContractInfos = updateReactiveMap(nftContractInfos, map => {
						map.set(nft.contract_address, {
							name: firstNFT.name || 'Unknown NFT',
							collection: firstNFT.collection_name || firstNFT.collection_symbol || 'Unknown Collection',
							balance: contractNFTs.length,
							loading: false,
						});
					});
				} else {
					nftContractInfos = updateReactiveMap(nftContractInfos, map => {
						map.set(nft.contract_address, {
							name: 'No NFTs owned',
							collection: 'Contract',
							balance: 0,
							loading: false,
						});
					});
				}
			});
		} catch (error) {
			console.error('Error loading NFT contract infos:', error);
			// Set error state for all contracts
			$nfts.forEach(nft => {
				if (!nft.contract_address) return;
				nftContractInfos = updateReactiveMap(nftContractInfos, map => {
					map.set(nft.contract_address, {
						name: 'Error loading',
						collection: 'Contract',
						balance: 0,
						loading: false,
					});
				});
			});
		}
	}

	async function loadNFTs() {
		// This function is no longer used - we load contract infos individually
		console.log('loadNFTs called but not needed');
	}

	// Watch for new tokens being added and initialize them
	$effect(() => {
		if (!$tokens?.length || !$selectedNetwork || !$selectedAddress || !$provider) return;

		// Only process if tokens array actually changed in length or we have genuinely new tokens
		if ($tokens.length !== lastTokensLength) {
			lastTokensLength = $tokens.length;
			const newTokens = getTokensWithContracts().filter(token => token.contract_address && !initializedTokens.has(token.contract_address));
			if (newTokens.length > 0) {
				console.log('Found new tokens to initialize:', newTokens.length);
				// Mark as initialized
				newTokens.forEach(token => {
					if (token.contract_address) initializedTokens.add(token.contract_address);
				});
				// Load info and balances for new tokens
				loadAllTokensInfo();
				loadAllTokenBalances();
			}
		}
	});

	// Watch for configured NFT contracts changes and reload NFTs - only when nfts array changes
	$effect(() => {
		if ($nfts && $selectedNetwork && $selectedAddress && $provider) {
			// Only reload if the number of NFT contracts actually changed
			if ($nfts.length !== lastNFTsLength) {
				console.log('NFT contracts changed, reloading contract infos...');
				lastNFTsLength = $nfts.length;
				loadNFTContractInfos();
			}
		}
	});

	// No auto-discovery for NFTs - they come from configured store only
</script>

<style>
	.wallet-balance {
		display: flex;
		flex-direction: column;
		gap: 10px;
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
		font-size: 13px;
	}

	.balance-row {
		display: flex;
		gap: 10px;
		padding: 10px;
	}

	.balance-row.desktop {
		align-items: center;
	}

	.balance-row.mobile {
		flex-direction: column;
	}

	.currency-info {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
	}

	.balance-info {
		display: flex;
		align-items: center;
	}

	.balance-row.mobile .balance-info {
		justify-content: space-between;
		margin-left: 50px; /* Align with currency name */
	}

	.balance-row.desktop .balance-info {
		/* For desktop, balance info is handled separately in desktopBalanceCell */
		display: none;
	}
</style>

{#snippet loadingState(size = '16px')}
	<Spinner {size} />
{/snippet}

{#snippet currencyIcon(iconURL, symbol, size = '40px')}
	<Icon img={iconURL || 'modules/' + module.identifier + '/img/token.svg'} alt={symbol || '?'} {size} padding="0px" />
{/snippet}

{#snippet balanceInfo(balanceData, symbol = '', showCurrency = true, countdown = 0, refreshFn = null)}
	<div class="balance">
		<div class="info">
			<div class="amount">
				{#if $debug}
					<pre>{stringifyWithBigInt(balanceData)}</pre>
				{/if}
				{formatBalance(balanceData.crypto)}
			</div>
			{#if balanceData.fiat}
				<div class="fiat">{formatBalance(balanceData.fiat, 2)}</div>
			{/if}
			{#if $debug}
				{#if balanceData.timestamp}
					<div class="fiat">retrieved {balanceData.timestamp.toLocaleTimeString()}</div>
				{/if}
				{#if countdown > 0}
					<div class="fiat">Refresh in: {countdown} s</div>
				{/if}
			{/if}
		</div>
		{#if refreshFn}
			<Icon img="img/reset.svg" alt="Refresh" size="16px" padding="5px" onClick={refreshFn} />
		{/if}
	</div>
{/snippet}

{#snippet failedBalanceInfo(refreshFn)}
	<div class="balance">
		<div class="info">
			<div class="amount">Failed to load</div>
			<div class="fiat">(click refresh to retry)</div>
		</div>
		<Icon img="img/reset.svg" alt="Retry" size="16px" padding="5px" onClick={refreshFn} />
	</div>
{/snippet}

{#snippet nftBalanceInfo(contractInfo)}
	<div class="balance">
		<div class="info">
			{#if contractInfo?.loading}
				<div class="amount">{@render loadingState()}</div>
			{:else}
				<div class="amount">Owned: {contractInfo?.balance || 0}</div>
				<div class="fiat">{contractInfo?.collection || 'Unknown Collection'}</div>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet currencyDisplay(iconURL, name, address = '', isLoading = false)}
	<div class="column">
		<div class="name">
			{#if isLoading}
				{@render loadingState()}
			{:else}
				{name}
			{/if}
		</div>
		{#if address}
			<div class="address">{address}</div>
		{/if}
	</div>
{/snippet}

{#snippet balanceRow(iconURL, symbol, name, address, balanceData = null, isLoadingBalance = false, isLoadingName = false, refreshFn = null, countdown = 0, fallbackMessage = null)}
	<div class="balance-row" class:mobile={$isMobile} class:desktop={!$isMobile}>
		<div class="currency-info">
			{@render currencyIcon(iconURL, symbol)}
			{@render currencyDisplay(iconURL, name, address, isLoadingName, address && ($debug || name.includes('UNKNOWN')))}
		</div>
		<div class="balance-info">
			{#if fallbackMessage}
				<div class="balance">
					<div class="info">
						<div class="amount">{fallbackMessage.title}</div>
						<div class="fiat">{fallbackMessage.subtitle}</div>
					</div>
				</div>
			{:else if isLoadingBalance}
				{@render loadingState()}
			{:else if balanceData}
				{@render balanceInfo(balanceData, symbol, false, countdown, refreshFn)}
			{:else if refreshFn}
				{@render failedBalanceInfo(refreshFn)}
			{/if}
		</div>
	</div>
{/snippet}

{#snippet desktopBalanceCell(balanceData, symbol = '', isLoadingBalance = false, refreshFn = null, countdown = 0)}
	{#if isLoadingBalance}
		{@render loadingState()}
	{:else if balanceData}
		{@render balanceInfo(balanceData, symbol, false, countdown, refreshFn)}
	{:else}
		{@render failedBalanceInfo(refreshFn)}
	{/if}
{/snippet}

<div class="wallet-balance">
	{#if $selectedNetwork && $selectedAddress}
		<Table>
			<Thead>
				<TheadTr backgroundColor="--secondary-background" color="--secondary-foreground">
					{#if $isMobile}
						<Th>Currency</Th>
					{:else}
						<Th>Currency</Th>
						<Th>Balance</Th>
					{/if}
				</TheadTr>
			</Thead>
			<Tbody>
				<Tr>
					{#if $isMobile}
						<Td padding="0" expand>
							<Clickable onClick={selectCurrency}>
								{@render balanceRow($selectedNetwork?.currency?.iconURL, $selectedNetwork.currency.symbol || '?', $selectedNetwork.currency.symbol || '?', '', balance, isLoadingBalance, false, refreshBalance, balanceCountdown)}
							</Clickable>
						</Td>
					{:else}
						<Td padding="0" expand>
							<Clickable onClick={selectCurrency}>
								{@render balanceRow($selectedNetwork?.currency?.iconURL, $selectedNetwork.currency.symbol || '?', $selectedNetwork.currency.symbol || '?', '', null, false, false, null, 0)}
							</Clickable>
						</Td>
						<Td>
							{@render desktopBalanceCell(balance, '', isLoadingBalance, refreshBalance, balanceCountdown)}
						</Td>
					{/if}
				</Tr>
			</Tbody>
		</Table>
		{#if $tokens?.length > 0}
			<Table>
				<Thead>
					<TheadTr backgroundColor="--secondary-background" color="--secondary-foreground">
						{#if $isMobile}
							<Th>Token</Th>
						{:else}
							<Th>Token</Th>
							<Th>Balance</Th>
						{/if}
					</TheadTr>
				</Thead>
				<Tbody>
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
								{#if $isMobile}
									<Td padding="0" expand>
										<Clickable onClick={() => selectToken(contract_address)}>
											{@render balanceRow(token?.iconURL, displaySymbol, displayName, $debug || !tokenInfo || tokenInfo.symbol === 'UNKNOWN' ? contract_address : '', tokenBalance, isLoadingBalance, isLoadingInfo, () => refreshToken(contract_address), tokenCountdowns.get(contract_address) || 0)}
										</Clickable>
									</Td>
								{:else}
									<Td padding="0" expand>
										<Clickable onClick={() => selectToken(contract_address)}>
											{@render balanceRow(token?.iconURL, displaySymbol, displayName, $debug || !tokenInfo || tokenInfo.symbol === 'UNKNOWN' ? contract_address : '', null, false, isLoadingInfo, null, 0)}
										</Clickable>
									</Td>
									<Td>
										{@render desktopBalanceCell(tokenBalance, displaySymbol, isLoadingBalance, () => refreshToken(contract_address), tokenCountdowns.get(contract_address) || 0)}
									</Td>
								{/if}
							</Tr>
						{:else}
							<Tr>
								{#if $isMobile}
									<Td padding="0" expand>
										{@render balanceRow(token?.iconURL, 'Unknown token', 'Unknown token (no contract address)', null, false, false, null, 0, { title: 'N/A', subtitle: '(No contract address)' })}
									</Td>
								{:else}
									<Td padding="0" expand>
										{@render balanceRow(token?.iconURL, 'Unknown token', 'Unknown token (no contract address)', '', null, false, false, null, 0)}
									</Td>
									<Td>
										<div class="balance">
											<div class="info">
												<div class="amount">N/A</div>
												<div class="fiat">(No contract address)</div>
											</div>
										</div>
									</Td>
								{/if}
							</Tr>
						{/if}
					{/each}
				</Tbody>
			</Table>
		{:else}
			No tokens found.
		{/if}
		{#if $nfts && $nfts.length > 0}
			<Table>
				<Thead>
					<TheadTr backgroundColor="--secondary-background" color="--secondary-foreground">
						<Th>NFT Contract</Th>
						<Th>Collection & Balance</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					{#each $nfts as nft, index}
						{@const contractInfo = nftContractInfos.get(nft.contract_address)}
						<Tr>
							<Td padding="0" expand>
								<Clickable onClick={() => selectNFT('')}>
									<div class="currency-info">
										{@render currencyIcon('modules/' + module.identifier + '/img/nft.svg', 'NFT Contract')}
										{@render currencyDisplay('modules/' + module.identifier + '/img/nft.svg', contractInfo?.loading ? 'Loading...' : contractInfo?.name || 'Unknown NFT', nft.contract_address, contractInfo?.loading, $debug)}
									</div>
								</Clickable>
							</Td>
							<Td>
								{@render nftBalanceInfo(contractInfo)}
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		{/if}
	{/if}
</div>
