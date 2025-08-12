<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { type INetwork, type INFT, findNetworkByGuid, reorderNFTs } from '@/org.libersoft.wallet/scripts/crypto-utils/network';
	import { tableDrag } from '@/core/actions/tableDrag.ts';
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
	import DragHandle from '@/core/components/Drag/DragHandle.svelte';
	import DialogNFTDel from '@/org.libersoft.wallet/dialogs/NetworksNFTsDel.svelte';

	interface Props {
		item: string;
	}

	let { item }: Props = $props();
	let network: INetwork | undefined = $derived(findNetworkByGuid(item));
	let nftToDelete: INFT | undefined = $state();
	let elDialogDel: DialogNFTDel | undefined = $state();
	let contractInfos = $state(new Map<string, { name: string; symbol: string } | null>());
	let loadingContractInfos = $state(new Set<string>());
	const setSettingsSection = getContext<Function>('setSettingsSection');

	async function loadContractInfo(contractAddress: string): Promise<void> {
		if (contractInfos.has(contractAddress) || loadingContractInfos.has(contractAddress)) return;

		loadingContractInfos.add(contractAddress);
		loadingContractInfos = new Set(loadingContractInfos); // Trigger reactivity

		try {
			// Try to get NFT collection info from blockchain
			// This could be expanded to get actual collection name and symbol from contract
			const info = { name: 'NFT Contract', symbol: 'NFT' }; // For now, basic placeholder
			contractInfos.set(contractAddress, info);
			contractInfos = new Map(contractInfos); // Trigger reactivity
		} catch (error) {
			console.warn(`Failed to load contract info for ${contractAddress}:`, error);
			contractInfos.set(contractAddress, null);
			contractInfos = new Map(contractInfos); // Trigger reactivity
		} finally {
			loadingContractInfos.delete(contractAddress);
			loadingContractInfos = new Set(loadingContractInfos); // Trigger reactivity
		}
	}

	// Load contract info for all NFT contracts when network changes
	$effect(() => {
		if (network?.nfts) {
			network.nfts.forEach(nft => {
				if (nft.item?.contract_address) {
					loadContractInfo(nft.item.contract_address);
				}
			});
		}
	});

	function clickNFTAdd(): void {
		setSettingsSection('networks-nfts-add-' + item);
	}

	function clickNFTEdit(nft: INFT): void {
		setSettingsSection('networks-nfts-edit-' + item + '-' + nft.guid);
	}

	async function delNFTDialog(nft: INFT): Promise<void> {
		nftToDelete = nft;
		await tick();
		elDialogDel?.open();
	}

	function handleNFTReorder(sourceIndex: number, targetIndex: number): void {
		if (!network?.nfts || !network.guid) return;

		const reordered = [...network.nfts];
		const [moved] = reordered.splice(sourceIndex, 1);
		reordered.splice(targetIndex, 0, moved);
		reorderNFTs(network.guid, reordered);
	}
</script>

<style>
	.nft-list {
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

	.info .details .token-id {
		font-size: 11px;
		color: var(--tertiary-foreground);
	}
</style>

<div class="nft-list">
	<div class="network">
		<div class="bold">Network:</div>
		<div>{network?.name}</div>
	</div>
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/nft.svg" text="Add NFT Contract" onClick={clickNFTAdd} />
	</ButtonBar>
	{#if network?.nfts && network.nfts.length > 0}
		<div use:tableDrag={{ items: network.nfts, onReorder: handleNFTReorder }}>
			<Table>
				<Thead>
					<TheadTr>
						<Th></Th>
						<Th>NFT Contract</Th>
						<Th>Actions</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					{#each network.nfts as nft, i (nft.guid)}
						{@const contractAddress = nft.item?.contract_address}
						{@const contractInfo = contractAddress ? contractInfos.get(contractAddress) : null}
						{@const isLoading = contractAddress ? loadingContractInfos.has(contractAddress) : false}
						{@const displayName = contractInfo?.name || 'NFT Contract'}
						<TbodyTr>
							<Td>
								<DragHandle />
							</Td>
							<Td expand>
								<div class="info">
									<Icon img={'modules/' + module.identifier + '/img/nft.svg'} alt={contractAddress} size="30px" padding="0px" />
									<div class="details">
										{#if isLoading}
											<Spinner size="16px" />
										{:else}
											<div class="name">{displayName}</div>
										{/if}
										<div class="address">{contractAddress || 'No contract address'}</div>
										<div class="token-id" style="font-style: italic;">All NFTs from this contract will be automatically loaded</div>
									</div>
								</div>
							</Td>
							<Td>
								<ActionItems align="right">
									<Icon img="img/edit.svg" alt="Edit NFT" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickNFTEdit(nft)} />
									<Icon img="img/del.svg" alt="Delete NFT" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => delNFTDialog(nft)} />
								</ActionItems>
							</Td>
						</TbodyTr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{:else}
		<div style="padding: 10px; text-align: center; color: var(--tertiary-foreground);">No NFT contracts configured. Click "Add NFT Contract" to add your first NFT contract.</div>
	{/if}
</div>
{#if nftToDelete && network?.guid}
	<DialogNFTDel networkGuid={network.guid} nft={nftToDelete} bind:this={elDialogDel} />
{/if}
