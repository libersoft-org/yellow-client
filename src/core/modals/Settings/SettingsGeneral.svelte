<script lang="ts">
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';

	import { runOnSystemStartup, showTrayIcon, closeToMinimize } from '@/core/settings.ts';

	const settings = [
		{ label: 'Run on system startup', store: runOnSystemStartup },
		{ label: 'Show tray icon', store: showTrayIcon },
		{ label: 'Close to minimize', store: closeToMinimize },
	];
</script>

<Table>
	<Thead>
		<TheadTr>
			{#each settings as setting}
				<Th>{setting.label}</Th>
			{/each}
		</TheadTr>
	</Thead>
	<Tbody>
		<TbodyTr>
			{#each settings as setting}
				<Td title={setting.label}>
					<Switch label="debug" checked={false} />
					<!-- TODO: Fix store binding for settings -->
				</Td>
			{/each}
		</TbodyTr>
	</Tbody>
</Table>
