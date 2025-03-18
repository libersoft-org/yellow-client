<script>
 import { onMount } from 'svelte';
 import Table from './table.svelte';
 import Tr from './table-tbody-tr.svelte';
 import Tbody from './table-tbody.svelte';
 import Td from './table-tbody-td.svelte';
 import { monitors, selectedMonitor, selectedNotificationsCorner } from '../notifications.ts';
</script>

<Table>
 <Tbody>
  <Tr>
   <Td>
    <div class="bold">Monitor:</div>
   </Td>
   <Td center={true}>
    <!--{JSON.stringify(monitors)}-->
    <select bind:value={$selectedMonitor}>
     {#each $monitors as monitor}
      <option value={monitor.name}>{monitor.name} ({monitor.size.width}x{monitor.size.height})</option>
     {/each}
    </select>
   </Td>
  </Tr>
  <Tr>
   <Td>
    <div class="bold">Corner:</div>
   </Td>
   <Td center={true}>
    <select bind:value={$selectedNotificationsCorner}>
     <option value="top-left">Top Left</option>
     <option value="top-right">Top Right</option>
     <option value="bottom-left">Bottom Left</option>
     <option value="bottom-right">Bottom Right</option>
    </select>
   </Td>
  </Tr>
 </Tbody>
</Table>
