<script lang="ts">
	import { gif_servers } from '@/org.libersoft.messages/scripts/gifs.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		server?: string | undefined;
	}
	let { server }: Props = $props();
	let elDialog;
	let dialogData = $derived({
		title: 'Delete GIF server',
		body: 'Would you like to delete GIF server: <span class="bold">' + server + '</span>?',
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	});

	export function open(): void {
		elDialog?.open();
	}

	function clickYes(): void {
		gif_servers.update(servers => servers.filter(s => s !== server));
		elDialog?.close();
	}

	function clickNo(): void {
		elDialog?.close();
	}
</script>

<Dialog data={dialogData} bind:this={elDialog} />
