<script lang="ts">
	import { gif_servers } from '../gifs.js';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		server?: string;
	}
	let { server }: Props = $props();
	let elDialog;
	let dialogData = $derived({
		title: 'Delete GIF server',
		body: 'Would you like to delete GIF server: <span class="bold">' + server + '</span>?',
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	});

	export function open() {
		elDialog.open();
	}

	function clickYes() {
		gif_servers.update(servers => {
			return servers.filter(s => s !== server);
		});
		elDialog.close();
	}

	function clickNo() {
		elDialog.close();
	}
</script>

<Dialog data={dialogData} bind:this={elDialog} />
