<script lang="ts">
	import { runOnSystemStartup, showTrayIcon, closeToMinimize } from '@/core/scripts/settings.ts';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	const settings = [
		{ label: 'Run on system startup', store: runOnSystemStartup },
		{ label: 'Show tray icon', store: showTrayIcon },
		{ label: 'Close to minimize', store: closeToMinimize },
	];
</script>

<Table>
	<Tbody>
		{#each settings as setting}
			<TbodyTr>
				<Td bold>{setting.label}:</Td>
				<Td>
					<Switch label="debug" checked={false} />
					<!-- TODO: Fix store binding for settings -->
				</Td>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
