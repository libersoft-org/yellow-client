<script lang="ts">
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import TheadTh from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import TbodyTd from '@/core/components/Table/TableTbodyTd.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import { TAURI } from '@/core/tauri.ts';
	import { zoom } from '@/core/settings.ts';
	import { setZoom } from '@/core/zoom.ts';
	import Input from '@/core/components/Input/Input.svelte';
	import { selected_theme_index, current_theme, themes_stored, default_theme } from '../../appearance_store.js';

	import Icon from '../Icon/Icon.svelte';
	import Button from '../Button/Button.svelte';
	import Accordion from '../Accordion/Accordion.svelte';
	import ButtonBar from '../Button/ButtonBar.svelte';
	import TableActionItems from '../Table/TableActionItems.svelte';
	import SettingsThemeEditor from './SettingsThemeEditor.svelte';

	$effect(() => {
		$themes_stored;
		$current_theme.properties;
		$selected_theme_index;
	});

	let expanded = $state(false);
	let edited_theme_index = $state(1);

	function editTheme(index) {
		edited_theme_index = index;
		expand();
	}

	function deleteTheme(index) {
		if ($themes_stored.length > 1 && index > 0) {
			$selected_theme_index = 0;
			themes_stored.update(arr => arr.filter(theme => $themes_stored.indexOf(theme) !== index));
		}
	}

	function expand() {
		expanded = !expanded;
	}

	function setTheme(index) {
		$selected_theme_index = index;
	}

	function create_new_theme() {
		let new_theme = JSON.parse(JSON.stringify(default_theme));
		new_theme.name = 'New Theme';
		themes_stored.update(arr => [...arr, new_theme]);
		$selected_theme_index = $themes_stored.length - 1;
	}

	// function delete_current_theme() {
	// 	if ($themes_stored.length > 1 && $selected_theme_index > 0) {
	// 		let current_index = $selected_theme_index;
	// 		$selected_theme_index = 0;
	// 		themes_stored.update(arr => arr.filter(theme => $themes_stored.indexOf(theme) !== current_index));
	// 	}
	// }
</script>

<style>
	.addressbook {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<!-- <Table>
	<Thead>
		<TheadTr>
			<TheadTh>Theme:</TheadTh>
		</TheadTr>
	</Thead>
	<Tbody>
		<TbodyTr>
			<TbodyTd>Theme:</TbodyTd>
			<TbodyTd>
				{#if expanded}
					<Button onClick={click_expand}>
						<Icon img="img/edit.svg" alt="Close" colorVariable="--primary-foreground" size="20px" padding="0px" />
					</Button>
				{:else}
					<Select type="number" bind:value={$selected_theme_index} current-index={$selected_theme_index}>
						{#each $themes_stored as theme, index (theme.name + index)}
							<Option text={theme.name} value={index} />
						{/each}
					</Select>
					{#if $selected_theme_index > 0}
						<Button onClick={click_expand}>
							<Icon img="img/edit.svg" alt="Close" colorVariable="--primary-foreground" size="20px" padding="0px" />
						</Button>
					{/if}
					<Button
						onClick={() => {
							click_expand();
							create_new_theme();
						}}
					>
						<Icon img="img/add.svg" alt="Close" colorVariable="--primary-foreground" size="20px" padding="0px" />
					</Button>
					{#if $selected_theme_index > 0}
						<Button onClick={delete_current_theme}>
							<Icon img="img/del.svg" alt="Close" colorVariable="--primary-foreground" size="20px" padding="0px" />
						</Button>
					{/if}
				{/if}
			</TbodyTd>
		</TbodyTr>
	</Tbody>

	<Table>
		<Tbody>
			<TbodyTr class="color_properties">

			</TbodyTr>
		</Tbody>
	</Table>
</Table> -->

<!-- {#each $themes_stored as theme, index}
	<TbodyTr>
		<TbodyTd title="Name">{theme.name}</TbodyTd>

		<TbodyTd title="Action">
			<TableActionItems>
				<Icon img="img/edit.svg" alt="Edit" colorVariable="--icon-blue" size="20px" padding="5" onClick={() => {}} />
				{#if index > 0 }
					<Icon img="img/del.svg" alt="Delete" colorVariable="--icon-red" size="20px" padding="5" onClick={() => {}} />
				{/if}
			</TableActionItems>
		</TbodyTd>
	</TbodyTr>
{/each} -->
{#if !expanded}
	<div class="addressbook">
		<ButtonBar>
			<Button
				onClick={() => {
					create_new_theme();
					editTheme($themes_stored.length - 1);
				}}
			>
				<Icon img="img/add.svg" alt="Add" colorVariable="--primary-foreground" size="20px" padding="0px" />
			</Button>
		</ButtonBar>
		{#if $themes_stored.length > 0}
			<Table breakpoint="0">
				<Thead>
					<TheadTr>
						<Th>Name</Th>

						<Th>Action</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					{#each $themes_stored as theme, index}
						<TbodyTr>
							<Td title="Name">
								<b>{theme.name}</b>
							</Td>
							<Td title="Action">
								<TableActionItems>
									<Icon img="img/appearance.svg" alt="Set" size="20px" padding="5px" onClick={() => setTheme(index)} />
									{#if index > 0}
										<Icon img="img/edit.svg" alt="Edit" size="20px" padding="5px" onClick={() => editTheme(index)} />
										<Icon img="img/del.svg" alt="Delete" size="20px" padding="5px" onClick={() => deleteTheme(index)} />
									{/if}
								</TableActionItems>
							</Td>
						</TbodyTr>
					{/each}
				</Tbody>
			</Table>
		{/if}
	</div>
{/if}

{#if expanded}
	<Button
		onClick={() => {
			expand();
		}}
	>
		<Icon img="img/close.svg" alt="Add" colorVariable="--primary-foreground" size="20px" padding="0px" />
	</Button>
	<SettingsThemeEditor {edited_theme_index} />
{/if}
