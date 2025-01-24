<script>
 import { sticker_servers } from '../stickers.js';
 import InputText from '../../../core/components/input-text.svelte';
 import Button from '../../../core/components/button.svelte';
 import Table from '../../../core/components/table.svelte';
 import Thead from '../../../core/components/table-thead.svelte';
 import TheadTr from '../../../core/components/table-thead-tr.svelte';
 import Th from '../../../core/components/table-thead-th.svelte';
 import Tbody from '../../../core/components/table-tbody.svelte';
 import TbodyTr from '../../../core/components/table-tbody-tr.svelte';
 import Td from '../../../core/components/table-tbody-td.svelte';
 import Item from '../../../core/components/icon.svelte';
 import { onMount } from 'svelte';
 let addUrl = '';
 let inputAdd;
 let error = '';

 onMount(() => {
  inputAdd.focus();
 });

 function onKeydownAdd(e) {
  if (e.key === 'Enter') clickAdd(addUrl);
 }

 function clickAdd() {
  sticker_servers.update(s => {
   s.push(addUrl);
   return s;
  });
  addUrl = '';
  inputAdd.focus();
 }

 function clickDel(url) {
  console.log('Click - Delete: ' + url);
  sticker_servers.update(servers => {
   return servers.filter(s => s !== url);
  });
  inputAdd.focus();
 }
</script>

<style>
 a {
  color: #000;
  text-decoration: none;
  font-weight: bold;
 }

 .group {
  display: flex;
  align-items: center;
  gap: 10px;
 }
</style>

<!--<Button text="Defaults" onClick={() => sticker_servers.set(['https://stickers.libersoft.org'])} />-->
<div class="group">
 <InputText placeholder="Add sticker server address" grow={true} bind:value={addUrl} onKeydown={onKeydownAdd} bind:this={inputAdd} />
 <Button text="Add" onClick={clickAdd} />
</div>
<Table>
 <Thead>
  <TheadTr>
   <Th>Sticker servers</Th>
   <Th>Action</Th>
  </TheadTr>
 </Thead>
 <Tbody>
  {#each $sticker_servers as s}
   <TbodyTr>
    <Td><a href={s} target="_blank">{s}</a></Td>
    <Td center={true}>
     <Item img="img/del.svg" alt="Delete" size="20" padding="5" onClick={() => clickDel(s)} />
    </Td>
   </TbodyTr>
  {/each}
 </Tbody>
</Table>
{#if error}
 <div class="error">{error}</div>
{/if}
