<script lang="ts">
	import { getContext } from 'svelte';
	import { TAURI } from '@/core/tauri.ts';
	import { zoom } from '@/core/settings.ts';
	import { setZoom } from '@/core/zoom.ts';
	import { selected_theme_index, current_theme, themes, user_themes, default_themes, type Theme } from '@/core/themes.ts';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import Range from '@/core/components/Range/Range.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	//import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	const setSettingsSection = getContext<Function>('setSettingsSection');

	function create_new_theme() {
		let new_theme = JSON.parse(JSON.stringify(default_themes[0]))[0];
		new_theme.name = 'New Theme';
		user_themes.update(arr => [...arr, new_theme]);
		$selected_theme_index = $themes.length - 1;
		setSettingsSection('edit-theme');
	}

	function delete_current_theme() {
		if ($user_themes.length > 1 && $selected_theme_index >= default_themes.length) {
			let current_index = $selected_theme_index - default_themes.length;
			$selected_theme_index = 0;
			user_themes.update(arr => arr.filter(theme => $user_themes.indexOf(theme) !== current_index));
		}
	}
</script>

<style>
	.zoom {
		display: flex;

		/*input {
			margin-top: 6px;
		}*/
	}
</style>

<Table>
	<Thead>
		<TheadTr>
			{#if TAURI}
				<Th>Zoom:</Th>
			{/if}
			<Th>Theme:</Th>
		</TheadTr>
	</Thead>
	<Tbody>
		<TbodyTr>
			{#if TAURI}
				<Td title="Zoom">
					<span>{Math.round(($zoom || 0) * 100)}%</span>
					<div class="zoom">
						<Range min="0.3" max="3" step="0.1" bind:value={$zoom} onchange={setZoom} />
					</div>
				</Td>
			{/if}
			<Td title="Theme">
				<Select data-testid="theme switch" bind:value={$selected_theme_index}>
					{#each $themes as theme, index (theme.name + index)}
						<Option text={theme.name} value={index} />
					{/each}
				</Select>
				{#if $selected_theme_index > 0}
					<Icon img="img/edit.svg" alt="Edit" colorVariable="--primary-foreground" size="20px" padding="0px" onClick={() => setSettingsSection('edit-theme')} />
				{/if}
				<Icon img="img/add.svg" alt="Add" colorVariable="--primary-foreground" size="20px" padding="0px" onClick={() => create_new_theme()} />
				{#if $selected_theme_index > 0}
					<Icon img="img/del.svg" alt="Delete" colorVariable="--primary-foreground" size="20px" padding="0px" onClick={delete_current_theme} />
				{/if}
			</Td>
		</TbodyTr>
	</Tbody>
</Table>
