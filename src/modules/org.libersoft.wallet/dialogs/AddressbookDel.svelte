<script lang="ts">
	import { type IAddressBookItem, deleteAddressBookItem } from 'libersoft-crypto/addressbook';
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
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	function clickYes() {
		deleteAddressBookItem(item.guid);
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}

	export function open() {
		console.log(item);
		elDialog?.open();
	}
</script>

{#snippet question()}
	<div>Would you like to delete this item from address book?</div>
	<br />
	<div>
		<span class="bold">Name:</span>
		<span>{item.name}</span>
	</div>
	<div>
		<span class="bold">Address:</span>
		<span>{item.address}</span>
	</div>
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
