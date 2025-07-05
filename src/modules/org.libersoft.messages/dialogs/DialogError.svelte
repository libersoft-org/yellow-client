<script lang="ts">
	import Dialog, { type IDialogData } from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		message: string;
		title?: string;
	}
	let { message, title = 'Error' }: Props = $props();
	let elDialog: Dialog;
	let dialogData: IDialogData = $derived({
		title: title,
		body: message,
		icon: 'img/cross.svg',
		buttons: [{ img: 'img/check.svg', text: 'OK', onClick: clickOK, expand: true }],
	});

	export function open() {
		elDialog?.open();
	}

	export function close() {
		elDialog?.close();
	}

	function clickOK() {
		elDialog?.close();
	}
</script>

<Dialog data={dialogData} bind:this={elDialog} />
