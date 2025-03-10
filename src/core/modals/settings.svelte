<script>
 import { notificationsEnabled } from '../core.js';
 import Table from '../components/table.svelte';
 import Tbody from '../components/table-tbody.svelte';
 import Tr from '../components/table-tbody-tr.svelte';
 import Td from '../components/table-tbody-td.svelte';
 import Switch from '../components/switch.svelte';
 let zoom = 100;

 function setZoom() {
  document.body.style.transform = 'scale(' + zoom / 100 + ')';
  document.body.style.transformOrigin = '0 0';
 }
</script>

<style>
 input[type='range'] {
  width: 100%;
  max-width: 300px;
 }
</style>

<Table>
 <Tbody>
  <Tr>
   <Td>
    <div class="bold">Zoom:</div>
   </Td>
   <Td center={true}>
    <div>{zoom}%</div>
    <input class="zoom" type="range" min="30" max="300" step="1" bind:value={zoom} on:change={setZoom} />
   </Td>
  </Tr>
  <Tr>
   <Td>
    <div class="bold">Notifications:</div>
   </Td>
   <Td center={true}>
    <Switch bind:checked={$notificationsEnabled} />
   </Td>
  </Tr>
 </Tbody>
</Table>
