<script lang="ts">
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import { selected_theme_index, current_theme, themes_stored, default_theme } from '../../appearance_store.js';

	import Icon from '../Icon/Icon.svelte';
	import Button from '../Button/Button.svelte';
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
</script>

<style>
	.themes-manager {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

{#if !expanded}
	<div class="themes-manager">
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
