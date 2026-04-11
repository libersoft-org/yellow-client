<script lang="ts">
	import { runOnSystemStartup, showTrayIcon, closeToMinimize } from '@/core/scripts/settings.ts';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
</script>

<Table>
	<Tbody>
		<TbodyTr>
			<Td bold>Run on system startup:</Td>
			<Td>
				<Switch label="Run on system startup" checked={$runOnSystemStartup} onchange={v => runOnSystemStartup.set(v)} />
			</Td>
		</TbodyTr>
		<TbodyTr>
			<Td bold>Show tray icon:</Td>
			<Td>
				<Switch label="Show tray icon" checked={$showTrayIcon} onchange={v => showTrayIcon.set(v)} />
			</Td>
		</TbodyTr>
		<TbodyTr>
			<Td bold>Close to minimize:</Td>
			<Td>
				<Switch label="Close to minimize" checked={$closeToMinimize} onchange={v => closeToMinimize.set(v)} />
			</Td>
		</TbodyTr>
	</Tbody>
</Table>
