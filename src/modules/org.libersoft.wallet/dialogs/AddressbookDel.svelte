<script lang="ts">
	import { addressBook, type IAddressBookItem } from '../wallet.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		item: IAddressBookItem;
	}
	let { item }: Props = $props();
	let elDialog;
	let dialogData = {
		title: 'Delete item from address book',
		body: question,
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	function clickYes() {
		addressBook.set($addressBook.filter(i => i.guid !== item.guid));
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
	<span>Would you like to delete the item "</span>
	<span class="bold">{item.name}</span>
	<span>" from address book?</span>
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
