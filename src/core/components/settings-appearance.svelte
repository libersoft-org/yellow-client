<script>
 import { onMount } from 'svelte';
 import Table from './table.svelte';
 import Tr from './table-tbody-tr.svelte';
 import Tbody from './table-tbody.svelte';
 import Td from './table-tbody-td.svelte';

 // Zoom settings
 export let zoom = 100;

 // Move setZoom function into this component
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
 </Tbody>
</Table>
