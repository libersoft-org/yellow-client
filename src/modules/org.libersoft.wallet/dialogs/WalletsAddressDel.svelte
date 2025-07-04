<script lang="ts">
	import { wallets, type IAddress, type IWallet } from '../wallet.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	let wallet: IWallet | undefined;
	let index: string | number | undefined;
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
		wallets.update(ws => ws.map(item => (item.address === wallet.address ? { ...item, addresses: (item.addresses ?? []).filter(a => a.index !== index) } : item)));
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}

	export function open(_wallet: IWallet, _index: string | number): void {
		wallet = _wallet;
		index = _index;
		elDialog?.open();
	}
</script>

{#snippet question()}
	<div>Would you like to delete this address from your wallet?</div>
	<br />
	{#if wallet?.addresses?.find(a => a.index === index)}
		{@const address = wallet.addresses.find(a => a.index === index)}
		<div>
			<span class="bold">Index:</span>
			<span>{address?.index}</span>
		</div>
		<div>
			<span class="bold">Name:</span>
			<span>{address?.name}</span>
		</div>
		<div>
			<span class="bold">Address:</span>
			<span>{address?.address}</span>
		</div>
	{/if}
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
