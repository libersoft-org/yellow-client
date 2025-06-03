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

	type Props = {
		edited_theme_index: number;
	};

	// let activeTab = $state('');

	let { edited_theme_index = 1 }: Props = $props();

	let theme_properties = Object.entries($current_theme.properties);
</script>

<TbodyTd title="Name">
	<Input type="text" bind:value={$themes_stored[edited_theme_index].name} />
</TbodyTd>

<TbodyTr>
	{#each theme_properties as theme_property_name, theme_property_value}
		<TbodyTd title={theme_property_name[0]}>
			<input type="color" bind:value={$themes_stored[edited_theme_index].properties[theme_property_name[0]]} />

			{$themes_stored[edited_theme_index].properties[theme_property_name[0]]}
		</TbodyTd>
	{/each}
</TbodyTr>
