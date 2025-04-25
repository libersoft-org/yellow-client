<script>
 import Select from '../Select/Select.svelte';
 import SelectOption from '../Select/SelectOption.svelte';
 import Table from '../Table/Table.svelte';
 import TableTBodyTr from '../Table/TableTBodyTr.svelte';
 import TableTBody from '../Table/TableTBody.svelte';
 import TableTBodyTd from '../Table/TableTBodyTd.svelte';
 import { getCurrentWebview } from '@tauri-apps/api/webview';
 import { log, TAURI } from '@/core/tauri.ts';

 export let zoom = 1;
 export let theme = 'light';

 async function setZoom() {
  if (TAURI) {
   log.debug('setZoom:', window.devicePixelRatio);
   let z = getCurrentWebview().getZoom();
   log.debug('zoom:', z);
   await getCurrentWebview().setZoom(zoom);
  }
 }
</script>

<style>
 input[type='range'] {
  width: 100%;
  max-width: 300px;
 }
</style>

<Table expand={true}>
 <TableTBody>
  <TableTBodyTr>
   <TableTBodyTd>
    <div class="bold">Zoom:</div>
   </TableTBodyTd>
   <TableTBodyTd center={true}>
    <div>{zoom}%</div>
    <input class="zoom" type="range" min="0.3" max="10" step="0.1" bind:value={zoom} on:change={setZoom} />
   </TableTBodyTd>
  </TableTBodyTr>
  <TableTBodyTr>
   <TableTBodyTd>
    <div class="bold">Theme:</div>
   </TableTBodyTd>
   <TableTBodyTd center={true}>
    <Select bind:value={theme}>
     <SelectOption value="light" text="Light" />
    </Select>
   </TableTBodyTd>
  </TableTBodyTr>
 </TableTBody>
</Table>
