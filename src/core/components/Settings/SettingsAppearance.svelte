<script lang="ts">
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import { TAURI } from '@/core/tauri.ts';
	import { zoom } from '@/core/settings.ts';
	import { setZoom } from '@/core/zoom.ts';
	import Input from '@/core/components/Input/Input.svelte';
	import { selected_theme_index, current_theme, themes_stored, default_theme } from '../../appearance_store.js';
	import Icon from '../Icon/Icon.svelte';
	import Button from '../Button/Button.svelte';
	import { convertFromShortHex } from '@/core/utils/colors.js';

	import ButtonBar from '../Button/ButtonBar.svelte';
	import SettingsThemes from './SettingsThemes.svelte';

	let { setItem = () => {} } = $props();

	$effect(() => {
		$themes_stored;
		$current_theme.properties;
		$selected_theme_index;
	});
	// let activeTab = $state('general');
</script>

<style>
	.zoom {
		display: flex;

		input {
			margin-top: 6px;
		}
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
						<input type="range" min="0.3" max="3" step="0.1" bind:value={$zoom} onchange={setZoom} />
					</div>
				</Td>
			{/if}
		</TbodyTr>
		<TbodyTr>
			<Td title="Theme">
				<Select type="number" bind:value={$selected_theme_index} current-index={$selected_theme_index} style="width:150px;">
					{#each $themes_stored as theme, index (theme.name + index)}
						<Option text={theme.name} value={index} />
					{/each}
				</Select>
				<Button
					img="img/edit.svg"
					onClick={() =>
						setItem({
							title: 'Theme Manager',
							tab: 'theme',
							// img: 'img/themes.svg',
							// onClick: () => setItem('themes'),
							component: SettingsThemes,
						})}
				/>
			</Td>
		</TbodyTr>
	</Tbody>
</Table>
