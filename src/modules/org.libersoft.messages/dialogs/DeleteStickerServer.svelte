<script lang="ts">
	import { sticker_servers } from '@/org.libersoft.messages/scripts/stickers.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		server?: string | undefined;
	}
	let { server }: Props = $props();
	let elDialog;
	let dialogData = $derived({
		title: 'Delete sticker server',
		body: 'Would you like to delete sticker server: <span class="bold">' + server + '</span>?',
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	});

	export function open() {
		elDialog.open();
	}

	function clickYes() {
		sticker_servers.update(servers => servers.filter(s => s !== server));
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}
</script>

<Dialog data={dialogData} bind:this={elDialog} />
