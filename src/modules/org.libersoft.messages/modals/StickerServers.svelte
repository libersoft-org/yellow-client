<script lang="ts">
	import { sticker_servers } from '../stickers.js';
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
	let addUrl = $state('');
	let error = $state('');
	let inputElement: typeof Input.prototype;

	$effect(() => {
		if (inputElement) inputElement.focus();
	});

	function onKeydownAdd(e) {
		if (e.key === 'Enter') clickAdd();
	}

	function clickAdd() {
		sticker_servers.update(s => {
			s.push(addUrl);
			return s;
		});
		addUrl = '';
		inputElement?.focus();
	}

	function clickDel(url) {
		console.log('Click - Delete: ' + url);
		sticker_servers.update(servers => {
			return servers.filter(s => s !== url);
		});
		inputElement?.focus();
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
	<Input placeholder="Add sticker server address" grow={true} bind:value={addUrl} onKeydown={onKeydownAdd} bind:this={inputElement} />
	<Button text="Add" onClick={clickAdd} />
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
