<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { debug, isMobile } from '@/core/scripts/stores.ts';
	import { stringifyWithBigInt } from '@/core/scripts/utils/utils.ts';
	import { selectedNetwork, tokens, nfts } from 'libersoft-crypto/network';
	import { getBalance, getTokenBalanceByAddress, getExchange, getTokenInfo, getBatchTokensInfo, getBatchTokenAmountsByAddresses, getNFTsFromConfiguredContracts, formatBalance, type IBalance, type INFTItem } from 'libersoft-crypto/balance';
	import { provider, rpcURL } from 'libersoft-crypto/provider';
	import { selectedAddress } from 'libersoft-crypto/wallet';
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
	let isLoadingBalance = $state(false);
	let loadingTokens = $state(new Set<string>());
	let loadingTokenInfos = $state(new Set<string>());
	let balanceCountdown = $state(0);
	let tokenCountdowns = $state(new Map<string, number>());
	const tokenTimers = new Map<string, ReturnType<typeof setTimeout>>();
	const initializedTokens = new Set<string>();
	let countdownInterval: ReturnType<typeof setInterval> | null = null;
	let balanceTimer: ReturnType<typeof setTimeout> | null = null;
	let nftContractInfos = $state(new Map<string, { name: string; collection: string; balance: number; loading: boolean }>());
	let lastNFTsLength = $state(0);
	let lastTokensLength = $state(0);
	let isInitialized = $state(false);
	let subscriptions: Array<() => void> = [];

	$inspect('TOKENINFOSSSS:', tokenInfos);
	$inspect('$tokens', $tokens);

	/*
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
*/

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
		//nftContractInfos.clear();
		//lastNFTsLength = 0;
		lastTokensLength = 0;
	}

	async function initializeAllBalances() {
		if ($selectedNetwork && $selectedAddress && $provider) {
			refreshBalance();
			//loadNFTContractInfos();
			if ($tokens?.length) {
				await loadAllTokensInfo();
				console.log('All token infos loaded:', tokenInfos);
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

	function initialize<T>(newValue: T, currentValue: T, updateCurrentValue: (value: T) => void) {
		if (isInitialized && newValue !== currentValue) {
			updateCurrentValue(newValue);
			clearAllTimers();
			if ($selectedNetwork && $selectedAddress && $provider) initializeAllBalances();
		}
	}

	// Lifecycle
	onMount(() => {
		// Initialize balances first time
		initializeAllBalances();
		countdownInterval = setInterval(updateCountdowns, 1000);
		// Set up subscriptions to watch for changes
		let currentNetwork = $selectedNetwork;
		let currentAddress = $selectedAddress;
		let currentRpcURL = $rpcURL;
		// Subscribe to network changes
		const unsubscribeNetwork = selectedNetwork.subscribe(newNetwork => {
			console.log(`Balance: Network changed to ${JSON.stringify(newNetwork?.name)} - reinitializing balances`);
			initialize(newNetwork, currentNetwork, value => (currentNetwork = value));
		});
		// Subscribe to address changes
		const unsubscribeAddress = selectedAddress.subscribe(newAddress => {
			console.log(`Balance: Address changed to ${newAddress} - reinitializing balances`);
			initialize(newAddress, currentAddress, value => (currentAddress = value));
		});
		// Subscribe to RPC URL changes
		const unsubscribeRPC = rpcURL.subscribe(newRpcURL => {
			console.log(`Balance: RPC URL changed to ${newRpcURL} - reinitializing balances`);
			initialize(newRpcURL, currentRpcURL, value => (currentRpcURL = value));
		});

		// Subscribe to tokens changes
		const unsubscribeTokens = tokens.subscribe(async tokensArray => {
			if (!isInitialized || !$selectedNetwork || !$selectedAddress || !$provider) return;

			// The existing functions already filter what needs loading, so just call them
			await loadAllTokensInfo();
			loadAllTokenBalances();
		});

		// Store unsubscribe functions for cleanup
		subscriptions = [unsubscribeNetwork, unsubscribeAddress, unsubscribeRPC, unsubscribeTokens];
		isInitialized = true; // Mark as initialized to enable reactive effects

		/*
		todo: refactor into unit tests
		console.log('😊😊😊😊😊😊😊😊😊', formatBalance({ amount: -99999999999999999999999999999999999999999123456789123456789n, decimals: 18, currency: 'ETH' }));
		console.log('😊😊😊😊😊😊😊😊😊', formatBalance({ amount: -1000n, decimals: 18, currency: 'ETH' }));
		console.log('😊😊😊😊😊😊😊😊😊', formatBalance({ amount: 123456789123456789n, decimals: 0, currency: 'ETH' }, 6));
		console.log('😊😊😊😊😊😊😊😊😊', formatBalance({ amount: 0n, decimals: 18, currency: 'ETH' }, 6));
		console.log('😊😊😊😊😊😊😊😊😊', formatBalance({ amount: 123456789123456789123456789123456789123456789123456789n, decimals: 40, currency: 'ETH' }, 2));
		*/
	});

	onDestroy(() => {
		clearAllTimers();
		// Clean up subscriptions
		subscriptions.forEach(unsubscribe => unsubscribe());
		subscriptions = [];
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
			console.log('Batch token info results:', batchResults);
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

		console.log('Loading all token balances for', tokensWithContracts.length, 'tokens');

		if (!tokensWithContracts.length) return;

		// Mark all as loading
		loadingTokens = updateReactiveSet(loadingTokens, set => {
			tokensWithContracts.forEach(token => token.contract_address && set.add(token.contract_address));
		});

		try {
			const contractAddresses = tokensWithContracts.map(token => token.contract_address!);
			// Use batch multicall to load all token balances at once
			const batchAmounts = await getBatchTokenAmountsByAddresses(contractAddresses);
			const batchBalances = new Map<string, IBalance>();
			batchAmounts.forEach((amount, contractAddress) => {
				if (amount) {
					batchBalances.set(contractAddress, { amount: amount.amount, decimals: amount.decimals, currency: tokenInfos.get(contractAddress)?.symbol || '?' });
				}
			});

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
	/*
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
	*/
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

	.item {
		display: flex;
		flex-direction: column;
		padding: 10px;
		align-items: center;
	}

	.item .currency {
		display: flex;
		align-items: center;
		gap: 10px;
	}
</style>

{#snippet balanceTable(title, items)}
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
				{@render itemRow(item.iconURL, item.name, item.symbol, item.address, item.balanceData, item.isLoadingName, item.isLoadingBalance, item.refreshFn)}
			{/each}
		</Tbody>
	</Table>
{/snippet}

{#snippet itemRow(iconURL, name, symbol, address, balanceData: ITokenData | null = null, isLoadingName = false, isLoadingBalance = false, refreshFn: (() => void) | null = null)}
	<Tr>
		<Td padding="0" expand>
			{#if $debug}
				<pre>{stringifyWithBigInt(balanceData)}</pre>
			{/if}
			<Clickable onClick={selectCurrency}>
				<div class="item">
					<div class="currency">
						{#if isLoadingName}
							{@render spinner()}
						{:else}
							{@render currencyIcon(iconURL, name)}
							{@render currencyNameSymbol(name, symbol, address)}
						{/if}
					</div>
					{#if $isMobile}
						{@render balanceInfo(balanceData)}
					{/if}
				</div>
			</Clickable>
		</Td>
		{#if !$isMobile}
			<Td>
				<div class="balance">
					{#if isLoadingBalance}
						{@render spinner()}
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
				</div>
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
	<div class="balance">
		<div class="info">
			<div class="amount">
				{#if balanceData?.crypto}
					{formatBalance(balanceData.crypto)}
				{:else}
					{@render spinner()}
				{/if}
			</div>
			{#if balanceData?.fiat}
				<div class="fiat">{formatBalance(balanceData.fiat, 2)}</div>
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
	</div>
{/snippet}

{#snippet spinner(size = '16px')}
	<Spinner {size} />
{/snippet}

{#snippet currencyIcon(iconURL, symbol, size = '40px')}
	<Icon img={iconURL || 'modules/' + module.identifier + '/img/token.svg'} alt={symbol || '?'} {size} padding="0px" />
{/snippet}

{#snippet currencyNameSymbol(name, symbol, address = null, isLoading = false)}
	<div class="column">
		<div class="name">
			{#if isLoading}
				{@render spinner()}
			{:else if name && symbol}
				{name} ({symbol})
			{:else if name && !symbol}
				{name}
			{:else if !name && symbol}
				{symbol}
			{:else}
				Unknown
			{/if}
		</div>
		{#if ($debug || (!name && !symbol)) && address}
			<div class="address">{address}</div>
		{/if}
	</div>
{/snippet}

<!--{#snippet refresh(contractAddress)}-->
<!--	<Icon img="img/reset.svg" alt="Refresh" size="16px" padding="5px" onClick={() => refreshToken(contractAddress)} />-->
<!--{/snippet}-->

<!--{#snippet failedBalanceInfo(refreshFn)}-->
<!--	<div class="balance">-->
<!--		<div class="info">-->
<!--			<div class="amount">Failed to load</div>-->
<!--			<div class="fiat">(click refresh to retry)</div>-->
<!--		</div>-->
<!--		<Icon img="img/reset.svg" alt="Retry" size="16px" padding="5px" onClick={refreshFn} />-->
<!--	</div>-->
<!--{/snippet}-->

<!--
{#snippet nftBalanceInfo(contractInfo)}
	<div class="balance">
		<div class="info">
			{#if contractInfo?.loading}
				<div class="amount">{@render spinner()}</div>
			{:else}
				<div class="amount">Owned: {contractInfo?.balance || 0}</div>
				<div class="fiat">{contractInfo?.collection || 'Unknown Collection'}</div>
			{/if}
		</div>
	</div>
{/snippet}
-->

<div class="wallet-balance">
	{#if $selectedNetwork && $selectedAddress}
		{@render balanceTable('Currency', [
			{
				iconURL: $selectedNetwork?.currency?.iconURL,
				name: null,
				symbol: $selectedNetwork?.currency?.symbol,
				address: null,
				balanceData: balance,
				isLoadingName: false,
				isLoadingBalance: isLoadingBalance,
				refreshFn: refreshBalance,
			},
		])}

		{#if $tokens?.length > 0}
			{@render balanceTable(
				'Token',
				$tokens
					.filter(t => t.contract_address)
					.map(t => {
						const tokenInfo = tokenInfos.get(t.contract_address);
						const tokenBalance = tokenBalances.get(t.contract_address);
						const isLoadingInfo = loadingTokenInfos.has(t.contract_address);
						const isLoadingBalance = loadingTokens.has(t.contract_address);
						return {
							iconURL: t.iconURL,
							name: tokenInfo?.name,
							symbol: tokenInfo?.symbol,
							address: t.contract_address,
							balanceData: tokenBalance,
							isLoadingName: isLoadingInfo,
							isLoadingBalance: isLoadingBalance,
							refreshFn: () => refreshToken(t.contract_address),
						};
					})
			)}
		{/if}

		<!--
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
										{@render currencyNameSymbol('modules/' + module.identifier + '/img/nft.svg', contractInfo?.loading ? 'Loading...' : contractInfo?.name || 'Unknown NFT', nft.contract_address, contractInfo?.loading, $debug)}
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
-->
	{/if}
</div>
