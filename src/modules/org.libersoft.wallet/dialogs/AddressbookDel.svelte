<script lang="ts">
	import { addressBook } from '../wallet.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	interface Props {
		params: {
			item: {
				guid: string;
				alias: string;
			};
		};
		close: () => void;
	}
	let { params, close }: Props = $props();
	let error: string | undefined;
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
		addressBook.set($addressBook.filter(i => i.guid !== params.item.guid));
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}

	export function open() {
		elDialog?.open();
	}
</script>

<style>
	.text {
		text-align: left;
	}
</style>

{#snippet question()}
	<div class="text">Would you like to delete the item "<span class="bold">{params.item.alias}</span>" from address book?</div>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
{/snippet}
<Dialog data={dialogData} bind:this={elDialog} />
