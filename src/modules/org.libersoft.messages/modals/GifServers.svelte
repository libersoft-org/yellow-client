<script lang="ts">
	import { gif_servers } from '../gifs.js';
	import DialogDefaultGifServers from '../dialogs/DefaultGifServers.svelte';
	import DialogDeleteGifServer from '../dialogs/DeleteGifServer.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	let inputElement: typeof Input.prototype;
	let elDialogDefaults;
	let elDialogDelete;
	let addUrl: string | null | undefined = $state();
	let error: string | null | undefined = $state();
	let serverUrl: string | undefined = $state();

	$effect(() => {
		if (inputElement) inputElement.focus();
	});

	function onKeydownAdd(e: KeyboardEvent) {
		if (e.key === 'Enter') clickAdd();
	}

	function clickDefaults() {
		elDialogDefaults.open();
	}

	function clickAdd() {
		error = null;
		if (addUrl) {
			let addUrlTrim = addUrl.trim();
			if (addUrlTrim === '') {
				error = 'GIF server address cannot be empty!';
				return;
			}
			if ($gif_servers.filter(s => s === addUrlTrim).length > 0) {
				error = 'GIF server already exists!';
				return;
			}
			gif_servers.update(s => {
				s.push(addUrlTrim);
				return s;
			});
			addUrl = null;
		}
		inputElement?.focus();
	}

	function clickDel(url) {
		serverUrl = url;
		elDialogDelete.open();
		gif_servers.update(servers => {
			return servers.filter(s => s !== url);
		});
		inputElement.focus();
	}
</script>

<style>
	a {
		color: var(--primary-foreground);
		text-decoration: none;
		font-weight: bold;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
</style>

<Button text="Reset to defaults" onClick={clickDefaults} />
<div class="row">
	<Input placeholder="Add GIF server address" expand bind:value={addUrl} onKeydown={onKeydownAdd} bind:this={inputElement} />
	<Button img="img/add.svg" text="Add" onClick={clickAdd} />
</div>
{#if $gif_servers.length > 0}
	<Table breakpoint="0">
		<Thead>
			<TheadTr>
				<Th>Gif servers:</Th>
				<Th>Action:</Th>
			</TheadTr>
		</Thead>
		<Tbody>
			{#each $gif_servers as s}
				<TbodyTr>
					<Td title="GIF servers">
						<a href={s} target="_blank">{s}</a>
					</Td>
					<Td title="Action">
						<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5px" onClick={() => clickDel(s)} />
					</Td>
				</TbodyTr>
			{/each}
		</Tbody>
	</Table>
{/if}
{#if error}
	<Alert type="error" message={error} />
{/if}
<DialogDeleteGifServer server={serverUrl} bind:this={elDialogDelete} />
<DialogDefaultGifServers bind:this={elDialogDefaults} />
