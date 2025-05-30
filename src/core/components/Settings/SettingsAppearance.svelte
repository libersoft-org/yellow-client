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
	import Input from '@/core/components/Input/Input.svelte';
	import { selected_theme_index, current_theme, themes_stored, default_theme } from '../../appearance_store.js';
	import Icon from '../Icon/Icon.svelte';
	import Button from '../Button/Button.svelte';
	import { convertFromShortHex } from '@/core/utils/colors.js';

	let { setSubItem, subTab } = $props();

	$effect(() => {
		$themes_stored;
		$current_theme.properties;
		$selected_theme_index;
	});

	let theme_properties = Object.entries($current_theme.properties);

	let expanded = $state(false);

	function click_expand() {
		expanded = !expanded;
		console.log(expanded);
	}

	function create_new_theme() {
		let new_theme = JSON.parse(JSON.stringify(default_theme));
		new_theme.name = 'New Theme';
		themes_stored.update(arr => [...arr, new_theme]);
		$selected_theme_index = $themes_stored.length - 1;
	}

	function delete_current_theme() {
		if ($themes_stored.length > 1 && $selected_theme_index > 0) {
			let current_index = $selected_theme_index;
			$selected_theme_index = 0;
			themes_stored.update(arr => arr.filter(theme => $themes_stored.indexOf(theme) !== current_index));
		}
	}

	function openAlerts() {
		setSubItem('theme');
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

{#if !subTab}
	<Button onClick={openAlerts}>Edit themes</Button>
{:else if subTab === 'theme'}
	<p>Theme editing here</p>
	<Button onClick={() => setSubItem('')}>← Back</Button>
{/if}

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
				{#if expanded}
					<TbodyTd title="Name">
						<Input type="text" bind:value={$themes_stored[$selected_theme_index].name} />
					</TbodyTd>

					<TbodyTr>
						{#each theme_properties as theme_property_name, theme_property_value}
							<TbodyTd title={theme_property_name[0]}>
								<Input type="color" bind:value={$themes_stored[$selected_theme_index].properties[theme_property_name[0]]} displayValue={convertFromShortHex($themes_stored[$selected_theme_index].properties[theme_property_name[0]])} />
								{$themes_stored[$selected_theme_index].properties[theme_property_name[0]]}
							</TbodyTd>
						{/each}
					</TbodyTr>
				{/if}
			</TbodyTr>
		</Tbody>
	</Table>
</Table>
