<script lang="ts">
	import { debug } from '@/core/stores.ts';
	import { log } from '@/core/tauri.ts';
	import { addNotification } from '@/core/notifications.ts';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import Files from '@/core/debug/Files.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	let elModalFiles1;
	let elModalFiles2;

	async function err() {
		throw new Error('Test exception!');
	}

	async function notification() {
		//log.debug('addNotification...');
		await addNotification({
			body: 'Notification body',
			callback: event => {
				log.debug('Debug notification callback: ' + event);
			},
		});
	}

	function openFiles1() {
		elModalFiles1.open();
	}

	function openFiles2() {
		elModalFiles2.open();
	}
</script>

{#if import.meta.env.VITE_YELLOW_CLIENT_DEBUG}
	<Switch bind:checked={$debug} />
	<Button onClick={err} text="/0" />
	<Button onClick={notification} text="N" />
	<Button onClick={openFiles1} text="F1" />
	<Button onClick={openFiles2} text="F2" />
{/if}

<Modal title="File Operations Test1" body={Files} bind:this={elModalFiles1} width="90%" />
<Modal title="File Operations Test2" body={Files} bind:this={elModalFiles2} width="90%" />
