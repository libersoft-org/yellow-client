<script lang="ts">
	import { wallets, type IAddress, type IWallet } from '../wallet.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		wallet: IWallet;
		address: IAddress;
	}
	let { wallet, address }: Props = $props();
	let elDialog;
	let dialogData = {
		title: 'Delete address from wallet',
		body: question,
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	function clickYes() {
		wallets.update(ws => ws.map(item => (item.address === wallet.address ? { ...item, addresses: (item.addresses ?? []).filter(a => a.index !== address.index) } : item)));
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
	<div>Would you like to delete this address from your wallet?</div>
	<br />
	<div>
		<span class="bold">Index:</span>
		<span>{address.index}</span>
	</div>
	<div>
		<span class="bold">Name:</span>
		<span>{address.name}</span>
	</div>
	<div>
		<span class="bold">Address:</span>
		<span>{address.address}</span>
	</div>
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
