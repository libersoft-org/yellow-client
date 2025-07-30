<script lang="ts">
	import { gif_servers, defaultGifServers } from '@/org.libersoft.messages/scripts/gifs.js';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	let elDialog;
	let dialogData = $derived({
		title: 'Reset GIF servers to default',
		body: 'Would you like to delete all your GIF servers and replace them with defaults?',
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
		gif_servers.set(defaultGifServers);
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}
</script>

<Dialog data={dialogData} bind:this={elDialog} />
