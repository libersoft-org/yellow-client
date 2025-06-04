<script lang="ts">
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import TbodyTd from '@/core/components/Table/TableTbodyTd.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import { current_theme, themes_stored } from '../../appearance_store.js';

	type Props = {
		edited_theme_index: number;
	};

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
