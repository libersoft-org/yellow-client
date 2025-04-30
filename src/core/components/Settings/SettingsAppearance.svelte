<script>
 import Select from '../Select/Select.svelte';
 import SelectOption from '../Select/SelectOption.svelte';
 import Table from '../Table/Table.svelte';
 import TableTBodyTr from '../Table/TableTBodyTr.svelte';
 import TableTBody from '../Table/TableTBody.svelte';
 import TableTBodyTd from '../Table/TableTBodyTd.svelte';
 import { TAURI } from '@/core/tauri.ts';
 import { zoom } from '@/core/settings.ts';
 import { setZoom } from '@/core/zoom.ts';

 export let theme = 'light';
</script>

<style>
 input[type='range'] {
  width: 100%;
  max-width: 300px;
 }
</style>

<Table expand={true}>
 <TableTBody>
  {#if TAURI}
   <TableTBodyTr>
    <TableTBodyTd>
     <div class="bold">Zoom:</div>
    </TableTBodyTd>
    <TableTBodyTd center={true}>
     <div>{Math.round(($zoom || 0) * 100, 2)}%</div>
     <input class="zoom" type="range" min="0.3" max="3" step="0.1" bind:value={$zoom} on:change={setZoom} />
    </TableTBodyTd>
   </TableTBodyTr>
  {/if}
  <TableTBodyTr>
   <TableTBodyTd>
    <div class="bold">Theme:</div>
   </TableTBodyTd>
   <TableTBodyTd center={true}>
    <Select bind:value={theme}>
     <SelectOption text="Light" value="light" />
    </Select>
   </TableTBodyTd>
  </TableTBodyTr>
 </TableTBody>
</Table>
