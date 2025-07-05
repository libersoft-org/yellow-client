<script lang="ts">
	import { wallets, type IWallet } from '../scripts/wallet.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		wallet: IWallet;
	}
	let { wallet }: Props = $props();
	let elDialog;
	let dialogData = {
		title: 'Delete wallet',
		body: question,
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	function clickYes() {
		wallets.update(ws => ws.filter(item => item !== wallet));
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
	<div>Would you like to delete the wallet "<span class="bold">{wallet.name}</span>"?</div>
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
