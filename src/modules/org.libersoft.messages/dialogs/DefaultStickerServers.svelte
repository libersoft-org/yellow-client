<script lang="ts">
	import { sticker_servers, defaultStickerServers } from '@/org.libersoft.messages/scripts/stickers.js';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	let elDialog;
	let dialogData = $derived({
		title: 'Reset sticker servers to default',
		body: 'Would you like to delete all your sticker servers and replace them with defaults?',
		icon: 'img/reset.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	});

	export function open() {
		elDialog?.open();
	}

	function clickYes() {
		sticker_servers.set(defaultStickerServers);
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}
</script>

<Dialog data={dialogData} bind:this={elDialog} />
