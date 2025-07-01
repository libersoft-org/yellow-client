<script lang="ts">
	import { networks, type INetwork } from '../wallet.ts';
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
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	function clickYes() {
		networks.set($networks.filter(i => i.guid !== item.guid));
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
