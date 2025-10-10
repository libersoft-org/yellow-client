<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { fromStore, get } from 'svelte/store';
	import { type INetwork, findNetworkByGuid, reorderNFTs, networks } from 'libersoft-crypto/network';
	import type { INftConf } from 'libersoft-crypto/nfts';
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
	let network: INetwork | undefined = $state();
	$effect(() => {
		network = findNetworkByGuid(item);
	});

	let nftToDelete: INftConf | undefined = $state();
	let elDialogDel: DialogNFTDel | undefined = $state();
	const setSettingsSection = getContext<Function>('setSettingsSection');

	function clickNFTAdd(): void {
		setSettingsSection('networks-nfts-add-' + item);
	}

	function clickNFTEdit(nft: INftConf): void {
		setSettingsSection('networks-nfts-edit-' + item + '-' + nft.guid);
	}

	async function delNFTDialog(nft: INftConf): Promise<void> {
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
		overflow: hidden;
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

	.info .details .address,
	.info .details .name,
	.info .details .token-id {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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
						{@const contractAddress = nft.contract_address}
						{@const displayName = 'NFT Contract'}
						{@const isLoading = false}
						<TbodyTr>
							<Td>
								<DragHandle />
							</Td>
							<Td expand class="ellipsis">
								<div class="info">
									<Icon img={'modules/' + module.identifier + '/img/nft.svg'} alt={contractAddress} size="30px" padding="0px" />
									<div class="details">
										{#if isLoading}
											<Spinner size="16px" />
										{:else}
											<div class="name">{displayName}</div>
										{/if}
										<div class="address">{contractAddress || 'No contract address'}</div>
										<div class="token-id" style="font-style: italic;"># {nft.token_id}</div>
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
