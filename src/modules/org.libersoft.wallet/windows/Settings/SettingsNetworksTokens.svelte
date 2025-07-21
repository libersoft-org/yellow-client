<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { type INetwork, type IToken, findNetworkByGuid, reorderTokens } from '@/org.libersoft.wallet/scripts/network.ts';
	import { getTokenInfo } from '@/org.libersoft.wallet/scripts/balance.ts';
	import { tableDrag } from '@/core/actions/tableDrag.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
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
	import DragHandle from '@/core/components/Drag/DragHandle.svelte';
	import DialogTokenDel from '@/org.libersoft.wallet/dialogs/NetworksTokensDel.svelte';
	interface Props {
		item: string;
	}
	let { item }: Props = $props();
	let network: INetwork | undefined = $derived(findNetworkByGuid(item));
	let tokenToDelete: IToken | undefined = $state();
	let tokenToDeleteInfo: { name: string; symbol: string } | null | undefined = $state();
	let elDialogDel: DialogTokenDel | undefined = $state();
	let tokenInfos = $state(new Map<string, { name: string; symbol: string } | null>());
	let loadingTokenInfos = $state(new Set<string>());
	const setSettingsSection = getContext<Function>('setSettingsSection');

	async function loadTokenInfo(contractAddress: string): Promise<void> {
		if (tokenInfos.has(contractAddress) || loadingTokenInfos.has(contractAddress)) return;

		loadingTokenInfos.add(contractAddress);
		loadingTokenInfos = new Set(loadingTokenInfos); // Trigger reactivity

		try {
			const info = await getTokenInfo(contractAddress);
			tokenInfos.set(contractAddress, info);
			tokenInfos = new Map(tokenInfos); // Trigger reactivity
		} catch (error) {
			console.warn(`Failed to load token info for ${contractAddress}:`, error);
			tokenInfos.set(contractAddress, null);
			tokenInfos = new Map(tokenInfos); // Trigger reactivity
		} finally {
			loadingTokenInfos.delete(contractAddress);
			loadingTokenInfos = new Set(loadingTokenInfos); // Trigger reactivity
		}
	}

	// Load token info for all tokens when network changes
	$effect(() => {
		if (network?.tokens) {
			network.tokens.forEach(token => {
				if (token.item?.contract_address) {
					loadTokenInfo(token.item.contract_address);
				}
			});
		}
	});

	function clickTokenAdd(): void {
		setSettingsSection('networks-tokens-add-' + item);
	}

	function clickTokenEdit(token: IToken): void {
		setSettingsSection('networks-tokens-edit-' + item + '-' + token.guid);
	}

	async function delTokenDialog(token: IToken): Promise<void> {
		tokenToDelete = token;
		// Get token info from our loaded map
		const contractAddress = token.item?.contract_address;
		tokenToDeleteInfo = contractAddress ? tokenInfos.get(contractAddress) : undefined;
		await tick();
		elDialogDel?.open();
	}

	function handleTokenReorder(sourceIndex: number, targetIndex: number): void {
		if (!network?.tokens || !network.guid) return;

		const reordered = [...network.tokens];
		const [moved] = reordered.splice(sourceIndex, 1);
		reordered.splice(targetIndex, 0, moved);
		reorderTokens(network.guid, reordered);
	}
</script>

<style>
	.token-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.network {
		display: flex;
		gap: 5px;
	}

	.info {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 5px 0;
	}

	.info .details {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.info .details .name {
		font-weight: bold;
	}

	.info .details .address {
		font-size: 12px;
	}
</style>

<div class="token-list">
	<div class="network">
		<div class="bold">Network:</div>
		<div>{network?.name}</div>
	</div>
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/token-add.svg" text="Add token" onClick={clickTokenAdd} />
	</ButtonBar>
	{#if network?.tokens && network.tokens.length > 0}
		<div use:tableDrag={{ items: network.tokens, onReorder: handleTokenReorder }}>
			<Table>
				<Thead>
					<TheadTr>
						<Th></Th>
						<Th>Token</Th>
						<Th>Actions</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					{#each network.tokens as token, i (token.guid)}
						{@const contractAddress = token.item?.contract_address}
						{@const tokenInfo = contractAddress ? tokenInfos.get(contractAddress) : null}
						{@const isLoading = contractAddress ? loadingTokenInfos.has(contractAddress) : false}
						<TbodyTr>
							<Td>
								<DragHandle />
							</Td>
							<Td expand>
								<div class="info">
									<Icon img={token.item?.iconURL || 'modules/' + module.identifier + '/img/token.svg'} alt={contractAddress} size="30px" padding="0px" />
									<div class="details">
										{#if isLoading}
											<Spinner size="16px" />
										{:else if tokenInfo}
											<div class="name">{tokenInfo.name} ({tokenInfo.symbol})</div>
										{:else if contractAddress}
											<div class="name">Unknown token</div>
										{:else}
											<div class="name">Invalid token (no contract address)</div>
										{/if}
										<div class="address">{contractAddress || 'No contract address'}</div>
									</div>
								</div>
							</Td>
							<Td>
								<ActionItems align="right">
									<Icon img="img/edit.svg" alt="Edit token" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickTokenEdit(token)} />
									<Icon img="img/del.svg" alt="Delete token" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => delTokenDialog(token)} />
								</ActionItems>
							</Td>
						</TbodyTr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{/if}
</div>
{#if tokenToDelete && network?.guid}
	<DialogTokenDel networkGuid={network.guid} token={tokenToDelete} tokenInfo={tokenToDeleteInfo} bind:this={elDialogDel} />
{/if}
