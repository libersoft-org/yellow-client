<script lang="ts">
	import { gif_servers } from '../gifs.js';
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
	let addUrl = $state('');
	let error = $state('');

	$effect(() => {
		if (inputElement) inputElement.focus();
	});

	function onKeydownAdd(e) {
		if (e.key === 'Enter') clickAdd();
	}

	function clickAdd() {
		gif_servers.update(s => {
			s.push(addUrl);
			return s;
		});
		addUrl = '';
		inputElement.focus();
	}

	function clickDel(url) {
		console.log('Click - Delete: ' + url);
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

	.group {
		display: flex;
		align-items: center;
		gap: 10px;
	}
</style>

<!--<Button text="Defaults" onClick={() => sticker_servers.set(['https://stickers.libersoft.org'])} />-->
<div class="group">
	<Input placeholder="Add gif server address" gexpandbind:value={addUrl} onKeydown={onKeydownAdd} bind:this={inputElement} />
	<Button img="img/add.svg" text="Add" onClick={clickAdd} />
</div>
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
				<Td title="Gif servers">
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
