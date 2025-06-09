<script lang="ts">
	import { convertFromShortHex } from '@/core/utils/colors.js';
	import { themes_stored, current_theme, selected_theme_index } from '@/core/themes.js';
	import Input from '@/core/components/Input/Input.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	//import Thead from '@/core/components/Table/TableThead.svelte';
	//import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	//import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	/*
	interface Props {
		name?: string;
	}
 let { name }: Props = $props();
	*/
	let theme_properties = Object.entries($current_theme.properties);
</script>

<Table>
	<Tbody>
		<TbodyTr>
			<Td title="Name">
				<Input type="text" bind:value={$themes_stored[$selected_theme_index].name} />
			</Td>
		</TbodyTr>
		{#each theme_properties as theme_property_name, theme_property_value}
			<TbodyTr>
				<Td title={theme_property_name[0]}>
					<Input type="color" bind:value={$themes_stored[$selected_theme_index].properties[theme_property_name[0]]} displayValue={convertFromShortHex($themes_stored[$selected_theme_index].properties[theme_property_name[0]])} />
					{$themes_stored[$selected_theme_index].properties[theme_property_name[0]]}
				</Td>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
