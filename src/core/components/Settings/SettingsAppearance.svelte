<script>
 import Select from '../Select/Select.svelte';
 import SelectOption from '../Select/SelectOption.svelte';
 import Table from '../Table/Table.svelte';
 import Tbody from '../Table/TableTbody.svelte';
 import TbodyTr from '../Table/TableTbodyTr.svelte';
 import Td from '../Table/TableTbodyTd.svelte';
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
 <Tbody>
  {#if TAURI}
   <TbodyTr>
    <Td>
     <div class="bold">Zoom:</div>
    </Td>
    <Td center={true}>
     <div>{Math.round(($zoom || 0) * 100, 2)}%</div>
     <input class="zoom" type="range" min="0.3" max="3" step="0.1" bind:value={$zoom} on:change={setZoom} />
    </Td>
   </TbodyTr>
  {/if}
  <TbodyTr>
   <Td>
    <div class="bold">Theme:</div>
   </Td>
   <Td center={true}>
    <Select bind:value={theme}>
     <SelectOption text="Light" value="light" />
    </Select>
   </Td>
  </TbodyTr>
 </Tbody>
</Table>
