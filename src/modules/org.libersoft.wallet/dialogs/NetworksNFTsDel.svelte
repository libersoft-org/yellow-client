<script lang="ts">
	import { deleteNFT, type INFT } from '../scripts/network.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		networkGuid: string;
		nft: INFT;
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
	{#if nft.item?.name}
		<div>
			<span class="bold">Name:</span>
			<span>{nft.item.name}</span>
		</div>
	{/if}
	<div>
		<span class="bold">Contract Address:</span>
		<span class="text-truncate">{nft.item?.contract_address || 'Unknown'}</span>
	</div>
	{#if nft.item?.token_id}
		<div>
			<span class="bold">Token ID:</span>
			<span>{nft.item.token_id}</span>
		</div>
	{/if}
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
