<script lang="ts">
	import { exit } from '@tauri-apps/plugin-process';
	import Dialog, { type IDialogData } from '@/core/components/Dialog/Dialog.svelte';
	let elDialog: Dialog;
	let dialogData: IDialogData = {
		title: 'Exit application',
		body: 'Would you really like to exit the application?',
		icon: 'img/exit.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, expand: true },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo, expand: true },
		],
	};

	export function open() {
		elDialog?.open();
	}

	async function clickYes() {
		console.log('Clicked on Yes button');
		await exit();
	}

	async function clickNo() {
		elDialog?.close();
	}
</script>

<Dialog data={dialogData} bind:this={elDialog} />
