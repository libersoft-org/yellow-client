<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { TAURI } from '@/core/tauri.ts';
	import { zoom, followBrowserTheme } from '@/core/settings.ts';
	import { setZoom } from '@/core/zoom.ts';
	import { selected_theme_index, current_theme, themes, user_themes, default_themes } from '@/core/themes.ts';
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
	import Switch from '@/core/components/Switch/Switch.svelte';
	//import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	const setSettingsSection = getContext<Function>('setSettingsSection');

	async function create_new_theme() {
		// Clone the current theme
		let new_theme = JSON.parse(JSON.stringify($current_theme));
		new_theme.name = $current_theme.name + ' Copy';

		// Update user themes first
		user_themes.update(arr => [...arr, new_theme]);

		// Use tick() to wait for the derived store to update, then set the index
		await tick();
		$selected_theme_index = $themes.length - 1;
		await setSettingsSection('edit-theme');
	}

	function delete_current_theme() {
		if ($selected_theme_index >= default_themes.length) {
			let current_index = $selected_theme_index - default_themes.length;
			$selected_theme_index = 0;
			user_themes.update(arr => arr.filter((_, index) => index !== current_index));
		}
	}
</script>

<style>
	.zoom {
		display: flex;
	}
</style>

<Table>
	<Thead>
		<TheadTr>
			{#if TAURI}
				<Th>Zoom:</Th>
			{/if}
			<Th>Browser Preference:</Th>
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
			<Td title="Follow browser theme preference">
				<Switch showLabel label="Follow browser theme" bind:checked={$followBrowserTheme} data-testid="follow-browser-theme-switch" />
			</Td>
			<Td title="Theme">
				<Select data-testid="theme switch" bind:value={$selected_theme_index} enabled={!$followBrowserTheme}>
					{#each $themes as theme, index (theme.name + index)}
						<Option text={theme.name} value={index} />
					{/each}
				</Select>
				{#if $selected_theme_index > 1}
					<Icon img="img/edit.svg" alt="Edit" colorVariable="--primary-foreground" size="20px" padding="0px" onClick={async () => await setSettingsSection('edit-theme')} testId="theme-edit-button" />
					<Icon img="img/del.svg" alt="Delete" colorVariable="--primary-foreground" size="20px" padding="0px" onClick={delete_current_theme} testId="theme-delete-button" />
				{/if}
				<Icon img="img/add.svg" alt="Add" colorVariable="--primary-foreground" size="20px" padding="0px" onClick={() => create_new_theme()} testId="theme-add-button" />
			</Td>
		</TbodyTr>
	</Tbody>
</Table>
