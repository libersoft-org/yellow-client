<script lang="ts">
	import { sticker_servers, defaultStickerServers } from '../stickers.js';
	import DialogDeleteStickerServer from '../dialogs/DeleteStickerServer.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	let elDialogDelete;
	let addUrl: string | null | undefined = $state();
	let error: string | null | undefined = $state();
	let inputElement: typeof Input.prototype;
	let serverUrl: string | undefined = $state();

	$effect(() => {
		if (inputElement) inputElement.focus();
	});

	function onKeydownAdd(e: KeyboardEvent) {
		if (e.key === 'Enter') clickAdd();
	}

	function clickAdd() {
		error = null;
		if (addUrl) {
			let addUrlTrim = addUrl.trim();
			if (addUrlTrim === '') {
				error = 'Sticker server address cannot be empty!';
				return;
			}
			if ($sticker_servers.filter(s => s === addUrlTrim).length > 0) {
				error = 'Sticker server already exists!';
				return;
			}
			sticker_servers.update(s => {
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

<Button text="Reset to defaults" onClick={() => sticker_servers.set(defaultStickerServers)} />
<div class="row">
	<Input placeholder="Add sticker server address" expand bind:value={addUrl} onKeydown={onKeydownAdd} bind:this={inputElement} />
	<Button img="img/add.svg" text="Add" onClick={clickAdd} />
</div>
<Table breakpoint="0">
	<Thead>
		<TheadTr>
			<Th>Sticker servers:</Th>
			<Th>Action:</Th>
		</TheadTr>
	</Thead>
	<Tbody>
		{#each $sticker_servers as s}
			<TbodyTr>
				<Td title="Sticker servers">
					<a href={s} target="_blank">{s}</a>
				</Td>
				<Td title="Action">
					<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5px" onClick={() => clickDel(s)} />
				</Td>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
{#if error}
	<Alert type="error" message={error} />
{/if}
<DialogDeleteStickerServer server={serverUrl} bind:this={elDialogDelete} />
