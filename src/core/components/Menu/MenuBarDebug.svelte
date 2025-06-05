<script>
	import { debug } from '@/core/core.ts';
	import { log } from '@/core/tauri.ts';
	import { addNotification } from '@/core/notifications.ts';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import Files from '@/core/debug/Files.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	let showFilesModal1 = false;
	let showFilesModal2 = false;

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
		showFilesModal1 = !showFilesModal1;
	}

	function openFiles2() {
		showFilesModal2 = !showFilesModal2;
	}
</script>

{#if import.meta.env.VITE_YELLOW_CLIENT_DEBUG}<Switch bind:checked={$debug} />
	<Button onClick={err}>/0</Button>
	<Button onClick={notification}>N</Button>
	<Button onClick={openFiles1}>F1</Button>
	<Button onClick={openFiles2}>F2</Button>
{/if}

<Modal title="File Operations Test1" body={Files} bind:show={showFilesModal1} width="90%" />
<Modal title="File Operations Test2" body={Files} bind:show={showFilesModal2} width="90%" />
