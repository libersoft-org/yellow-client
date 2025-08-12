<script lang="ts">
	import { type IWallet, deleteWallet } from '@/org.libersoft.wallet/scripts/crypto-utils/wallet';
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
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	function clickYes() {
		deleteWallet(wallet);
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
