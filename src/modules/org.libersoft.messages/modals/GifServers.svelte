<script lang="ts">
	import { gif_servers } from '../gifs.js';
	import Input from '@/core/components/Input/Input.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import TheadTh from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import TbodyTd from '@/core/components/Table/TableTbodyTd.svelte';

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
	<Input placeholder="Add gif server address" grow={true} bind:value={addUrl} onKeydown={onKeydownAdd} bind:this={inputElement} />
	<Button text="Add" onClick={clickAdd} />
</div>

<Table breakpoint="0">
	<Thead>
		<TheadTr>
			<TheadTh>Gif servers:</TheadTh>
			<TheadTh>Action:</TheadTh>
		</TheadTr>
	</Thead>
	<Tbody>
		{#each $gif_servers as s}
			<TbodyTr>
				<TbodyTd title="Gif servers">
					<a href={s} target="_blank">{s}</a>
				</TbodyTd>
				<TbodyTd title="Action">
					<Icon img="img/del.svg" colorVariable="--icon-red" alt="Delete" size="20px" padding="5px" onClick={() => clickDel(s)} />
				</TbodyTd>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
{#if error}
	<div class="error">{error}</div>
{/if}
