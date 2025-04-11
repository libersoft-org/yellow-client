<script>
 import Select from '../Select/Select.svelte';
 import SelectOption from '../Select/SelectOption.svelte';
 import Table from '../Table/Table.svelte';
 import TableTBodyTr from '../Table/TableTBodyTr.svelte';
 import TableTBody from '../Table/TableTBody.svelte';
 import TableTBodyTd from '../Table/TableTBodyTd.svelte';
 export let zoom = 100;
 export let theme = 'light';

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

<Table expand={true}>
 <TableTBody>
  <TableTBodyTr>
   <TableTBodyTd>
    <div class="bold">Zoom:</div>
   </TableTBodyTd>
   <TableTBodyTd center={true}>
    <div>{zoom}%</div>
    <input class="zoom" type="range" min="30" max="300" step="1" bind:value={zoom} on:change={setZoom} />
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
