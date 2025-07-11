<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { TAURI } from '@/core/scripts/tauri.ts';
	import { zoom, followBrowserTheme } from '@/core/scripts/settings.ts';
	import { setZoom } from '@/core/scripts/zoom.ts';
	import { selected_theme_index, current_theme, themes, user_themes, default_themes } from '@/core/scripts/themes.ts';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import Range from '@/core/components/Range/Range.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import ActionItems from '@/core/components/Table/TableActionItems.svelte';
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

	.theme {
		display: flex;
		gap: 10px;
	}
</style>

<Table>
	<Tbody>
		{#if TAURI}
			<TbodyTr>
				<Td bold>Zoom:</Td>
				<Td>
					<span>{Math.round(($zoom || 0) * 100)}%</span>
					<div class="zoom">
						<Range min="0.3" max="3" step="0.1" bind:value={$zoom} onchange={setZoom} />
					</div>
				</Td>
			</TbodyTr>
		{/if}
		<TbodyTr>
			<Td bold>Follow browser theme preference:</Td>
			<Td>
				<Switch label="Follow browser theme" bind:checked={$followBrowserTheme} data-testid="follow-browser-theme-switch" />
			</Td>
		</TbodyTr>
		<TbodyTr>
			<Td bold>Theme:</Td>
			<Td>
				<div class="theme">
					<Select data-testid="theme switch" bind:value={$selected_theme_index} enabled={!$followBrowserTheme}>
						{#each $themes as theme, index (theme.name + index)}
							<Option text={theme.name} value={index} />
						{/each}
					</Select>
					<ActionItems>
						{#if $selected_theme_index > 1}
							<Icon img="img/edit.svg" alt="Edit" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={async () => await setSettingsSection('edit-theme')} testId="theme-edit-button" />
							<Icon img="img/del.svg" alt="Delete" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={delete_current_theme} testId="theme-delete-button" />
						{/if}
						<Icon img="img/add.svg" alt="Add" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => create_new_theme()} testId="theme-add-button" />
					</ActionItems>
				</div>
			</Td>
		</TbodyTr>
	</Tbody>
</Table>
