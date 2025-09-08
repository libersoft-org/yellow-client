<script lang="ts">
	import { getContext } from 'svelte';
	import { type INetwork, type IToken, findNetworkByGuid, addToken } from 'libersoft-crypto/network';
	import { getGuid } from '@/core/scripts/utils/utils.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import ActionItems from '@/core/components/Table/TableActionItems.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';

	interface WrappedToken {
		wrappedTokenAddress: string;
		wrappedNetworkId: number;
		tags?: string[];
		name?: string;
		symbol?: string;
	}

	interface TokenListToken {
		name: string;
		symbol: string;
		decimals: number;
		originTokenAddress: string;
		originNetworkId: number;
		logoURI?: string;
		wrappedTokens?: WrappedToken[];
	}

	interface TokenList {
		name: string;
		version: number;
		logoURI?: string;
		description?: string;
		timestamp: string;
		tokens: TokenListToken[];
	}

	interface Props {
		close: () => void;
		item: string;
	}

	let { close, item }: Props = $props();
	let network: INetwork | undefined = $derived(findNetworkByGuid(item));
	let tokenList: TokenList | null = $state(null);
	let loading = $state(false);
	let error: string | null = $state(null);
	let addedTokens = $state(new Set<string>());

	export function onOpen(): void {
		fetchPopularTokens();
	}

	async function fetchPopularTokens(): Promise<void> {
		loading = true;
		error = null;

		try {
			const response = await fetch('https://api-polygon-tokens.polygon.technology/tokenlists/popular.tokenlist.json');
			if (!response.ok) {
				throw new Error(`Failed to fetch token list: ${response.statusText}`);
			}
			tokenList = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch popular tokens';
			console.error('Error fetching popular tokens:', err);
		} finally {
			loading = false;
		}
	}

	function getPolygonContractAddress(token: TokenListToken): string | null {
		// Look for wrapped version on Polygon
		if (!token.wrappedTokens || token.wrappedTokens.length === 0) {
			return null;
		}

		// Find the wrapped token for Polygon (wrappedNetworkId is -1 for Polygon mainnet)
		// Prefer PoS bridge tokens, then fallback to any Polygon token
		const polygonToken = token.wrappedTokens.find(wrapped => wrapped.wrappedNetworkId === -1 && wrapped.tags?.includes('pos')) || token.wrappedTokens.find(wrapped => wrapped.wrappedNetworkId === -1);

		const address = polygonToken?.wrappedTokenAddress;
		// Filter out zero/null addresses and special addresses
		if (!address || address === '0x0000000000000000000000000000000000000000' || address === '0x0000000000000000000000000000000000001010') {
			return null;
		}

		return address;
	}

	function isTokenAlreadyAdded(contractAddress: string): boolean {
		if (!network?.tokens) return false;
		return network.tokens.some(token => token.item?.contract_address?.toLowerCase() === contractAddress.toLowerCase());
	}

	function addPopularToken(popularToken: TokenListToken): void {
		if (!network?.guid) return;

		const contractAddress = getPolygonContractAddress(popularToken);
		if (!contractAddress) return;

		if (isTokenAlreadyAdded(contractAddress)) {
			return;
		}

		const token: IToken = {
			guid: getGuid(),
			item: {
				contract_address: contractAddress,
				iconURL: popularToken.logoURI,
			},
		};

		addToken(network.guid, token);
		addedTokens.add(contractAddress);
		addedTokens = new Set(addedTokens); // Trigger reactivity
	}

	function getDisplayTokens(): { token: TokenListToken; contractAddress: string; uniqueKey: string }[] {
		if (!tokenList?.tokens) return [];

		const seenAddresses = new Set<string>();

		return tokenList.tokens
			.map(token => ({
				token,
				contractAddress: getPolygonContractAddress(token),
			}))
			.filter(item => {
				if (item.contractAddress === null) return false;

				// Filter out duplicates
				if (seenAddresses.has(item.contractAddress.toLowerCase())) {
					return false;
				}
				seenAddresses.add(item.contractAddress.toLowerCase());
				return true;
			})
			.map(item => ({
				...item,
				uniqueKey: `${item.token.symbol}-${item.contractAddress}`,
			})) as { token: TokenListToken; contractAddress: string; uniqueKey: string }[];
	}
</script>

<style>
	.popular-tokens {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.network {
		display: flex;
		gap: 5px;
	}

	.token-info {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 5px 0;
	}

	.token-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.token-name {
		font-weight: bold;
	}

	.token-symbol {
		font-size: 14px;
		color: var(--secondary-foreground);
	}

	.token-address {
		font-size: 12px;
		color: var(--muted-foreground);
		font-family: monospace;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}
</style>

<div class="popular-tokens">
	<div class="network">
		<div class="bold">Network:</div>
		<div>{network?.name}</div>
	</div>

	<ButtonBar>
		<Button img="img/back.svg" text="Back to Tokens" onClick={close} />
		{#if !loading}
			<Button img="modules/{module.identifier}/img/refresh.svg" text="Refresh" onClick={fetchPopularTokens} />
		{/if}
	</ButtonBar>

	{#if loading}
		<div class="loading-container">
			<Spinner size="32px" />
		</div>
	{:else if error}
		<Alert type="error" message={error} />
		<ButtonBar>
			<Button img="modules/{module.identifier}/img/refresh.svg" text="Try Again" onClick={fetchPopularTokens} />
		</ButtonBar>
	{:else if tokenList}
		{@const displayTokens = getDisplayTokens()}
		{#if displayTokens.length > 0}
			<Table>
				<Thead>
					<TheadTr>
						<Th>Token</Th>
						<Th>Actions</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					{#each displayTokens as { token, contractAddress, uniqueKey } (uniqueKey)}
						{@const isAdded = isTokenAlreadyAdded(contractAddress)}
						{@const isJustAdded = addedTokens.has(contractAddress)}
						<TbodyTr>
							<Td expand>
								<div class="token-info">
									<Icon img={token.logoURI || 'modules/' + module.identifier + '/img/token.svg'} alt={token.symbol} size="30px" padding="0px" />
									<div class="token-details">
										<div class="token-name">{token.name}</div>
										<div class="token-symbol">{token.symbol}</div>
										<div class="token-address">{contractAddress}</div>
									</div>
								</div>
							</Td>
							<Td>
								<ActionItems align="right">
									{#if isAdded || isJustAdded}
										<Button img="img/check.svg" text="Added" enabled={false} />
									{:else}
										<Button img="modules/{module.identifier}/img/token-add.svg" text="Add" onClick={() => addPopularToken(token)} data-testid="add-token-{token.symbol}" />
									{/if}
								</ActionItems>
							</Td>
						</TbodyTr>
					{/each}
				</Tbody>
			</Table>
		{:else}
			<Alert type="info" message="No popular tokens with Polygon addresses found." />
		{/if}
	{/if}
</div>
