<script lang="ts">
	import { networks, type INetwork, deleteNetwork } from '../scripts/wallet.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		item: INetwork;
	}
	let { item }: Props = $props();
	let elDialog;
	let dialogData = {
		title: 'Delete network',
		body: question,
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true, testId: 'wallet-settings-network-delete-yes-btn' },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo, testId: 'wallet-settings-network-delete-no-btn' },
		],
	};

	function clickYes() {
		deleteNetwork(item);
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
	<div>Would you like to delete the network "<span class="bold">{item.name}</span>"?</div>
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
