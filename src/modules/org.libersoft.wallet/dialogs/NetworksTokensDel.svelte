<script lang="ts">
	import { deleteToken, type IToken } from '../scripts/wallet.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		networkGuid: string;
		token: IToken;
	}
	let { networkGuid, token }: Props = $props();
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
	<div>Would you like to delete this token: "<span class="bold">{token.name} ({token.symbol})</span>"?</div>
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
