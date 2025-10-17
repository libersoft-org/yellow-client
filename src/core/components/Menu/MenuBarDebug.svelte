<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { log } from '@/core/scripts/tauri.ts';
	import { addNotification } from '@/core/scripts/notifications.ts';
	import Window from '@/core/components/Window/Window.svelte';
	import Files from '@/core/debug/Files.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	let elWindowFiles1;
	let elWindowFiles2;

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
		elWindowFiles1?.open();
	}

	function openFiles2() {
		elWindowFiles2?.open();
	}
</script>

{#if import.meta.env.VITE_YELLOW_CLIENT_DEBUG}
	<Switch bind:checked={$debug} label="Debug" />
	<Button onClick={err} text="/0" />
	<Button onClick={notification} text="N" />
	<Button onClick={openFiles1} text="F1" />
	<Button onClick={openFiles2} text="F2" />
{/if}

<Window title="File Operations Test1" body={Files} bind:this={elWindowFiles1} width="90%" />
<Window title="File Operations Test2" body={Files} bind:this={elWindowFiles2} width="90%" />
