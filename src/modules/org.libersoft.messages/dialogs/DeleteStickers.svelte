<script lang="ts">
	import { stickers_db } from '@/org.libersoft.messages/scripts/db.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	let elDialog;
	let dialogData = {
		title: 'Delete sticker database',
		body: 'Would you like to delete local sticker database?',
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	export function open() {
		elDialog?.open();
	}

	function clickYes() {
		stickers_db.delete();
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}
</script>

<Dialog data={dialogData} bind:this={elDialog} />
