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
	import { TAURI } from '@/core/tauri.ts';
	import { zoom } from '@/core/settings.ts';
	import { setZoom } from '@/core/zoom.ts';

	import { selected_theme_index, current_theme, themes_stored } from '../../appearance_store.js';
	import Button from '../Button/Button.svelte';

	import ButtonBar from '../Button/ButtonBar.svelte';
	import SettingsThemes from './SettingsThemes.svelte';

	$effect(() => {
		$themes_stored;
		$current_theme.properties;
		$selected_theme_index;
	});
	let activeTab = $state('general');

	function setItem(name) {
		console.log('themes');
		activeTab = name;
	}
</script>

<style>
	.zoom {
		display: flex;

		input {
			margin-top: 6px;
		}
	}
</style>

{#if activeTab === 'general'}
	<Table>
		<Thead>
			<TheadTr>
				{#if TAURI}
					<TheadTh>Zoom:</TheadTh>
				{/if}
				<TheadTh>Theme:</TheadTh>
			</TheadTr>
		</Thead>
		<Tbody>
			<TbodyTr>
				{#if TAURI}
					<TbodyTd title="Zoom">
						<span>{Math.round(($zoom || 0) * 100)}%</span>
						<div class="zoom">
							<input type="range" min="0.3" max="3" step="0.1" bind:value={$zoom} onchange={setZoom} />
						</div>
					</TbodyTd>
				{/if}
			</TbodyTr>
		</Tbody>
	</Table>

	<ButtonBar>
		<Select type="number" bind:value={$selected_theme_index} current-index={$selected_theme_index} style="width:150px;">
			{#each $themes_stored as theme, index (theme.name + index)}
				<Option text={theme.name} value={index} />
			{/each}
		</Select>

		<Button onClick={() => setItem('themes')}>Manage Themes</Button>
	</ButtonBar>
{:else if activeTab === 'themes'}
	<SettingsThemes />
{/if}
