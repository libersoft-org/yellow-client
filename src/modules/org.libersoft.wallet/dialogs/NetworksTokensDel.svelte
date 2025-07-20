<script lang="ts">
	import { deleteToken, type IToken } from '../scripts/network.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		networkGuid: string;
		token: IToken;
		tokenInfo?: { name: string; symbol: string } | null;
	}
	let { networkGuid, token, tokenInfo }: Props = $props();
	let elDialog;
	let dialogData = {
		title: 'Delete token',
		body: question,
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	function clickYes() {
		deleteToken(networkGuid, token.guid);
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
	<div>Would you like to delete this token?<br /><br /></div>
	{#if tokenInfo}
		<div>
			<span class="bold">Token:</span>
			<span>{tokenInfo.name} ({tokenInfo.symbol})</span>
		</div>
	{/if}
	<div>
		<span class="bold">Contract Address:</span>
		<span>{token.item.contract_address}</span>
	</div>
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
