<script lang="ts">
	import { deleteNFT } from 'libersoft-crypto/network';
	import type { INftConf } from 'libersoft-crypto/nfts';
	import { nftTokenMetadatas } from 'libersoft-crypto/nfts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		networkGuid: string;
		nft: INftConf;
	}
	let { networkGuid, nft }: Props = $props();
	let elDialog;
	let dialogData = {
		title: 'Delete NFT Contract',
		body: question,
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	function clickYes() {
		deleteNFT(networkGuid, nft.guid);
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}

	export function open() {
		elDialog?.open();
	}
</script>

{#snippet question()}
	<div>Would you like to delete this NFT contract?<br /><br /></div>
	{@const nftInfo = $nftTokenMetadatas.get(nft.guid)}
	{#if nftInfo?.name}
		<div>
			<span class="bold">Name:</span>
			<span>{nftInfo.name}</span>
		</div>
	{/if}
	<div>
		<span class="bold">Contract Address:</span>
		<span>{nft.contract_address || 'Unknown'}</span>
	</div>
	{#if nft.token_id}
		<div>
			<span class="bold">Token ID:</span>
			<span>{nft.token_id}</span>
		</div>
	{/if}
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
