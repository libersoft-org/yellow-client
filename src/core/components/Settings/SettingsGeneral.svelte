<script>
 import Switch from '../Switch/Switch.svelte';
 import Table from '../Table/Table.svelte';
 import Tbody from '../Table/TableTbody.svelte';
 import Tr from '../Table/TableTbodyTr.svelte';
 import Td from '../Table/TableTbodyTd.svelte';

 import { runOnSystemStartup, showTrayIcon, closeToMinimize } from '@/core/settings.ts';
</script>

<style>
</style>

<Table expand={true}>
 <Tbody>
  <Tr>
   <Td>
    <div class="bold">Run on system startup:</div>
   </Td>
   <Td center={true}>
    <Switch bind:checked={$runOnSystemStartup} />
   </Td>
  </Tr>
  <Tr>
   <Td>
    <div class="bold">Show tray icon:</div>
   </Td>
   <Td center={true}>
    <Switch bind:checked={$showTrayIcon} />
   </Td>
  </Tr>
  <Tr>
   <Td>
    <div class="bold">Close to minimize:</div>
   </Td>
   <Td center={true}>
    <Switch bind:checked={$closeToMinimize} />
   </Td>
  </Tr>
 </Tbody>
</Table>
