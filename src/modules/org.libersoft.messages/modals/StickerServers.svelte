<script>
 import { sticker_servers } from '../stickers.js';
 import Input from '@/core/components/Input/Input.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import Table from '@/core/components/Table/Table.svelte';
 import TableTHead from '@/core/components/Table/TableTHead.svelte';
 import TableTHeadTr from '@/core/components/Table/TableTHeadTr.svelte';
 import TableTHeadTh from '@/core/components/Table/TableTHeadTh.svelte';
 import TableTBody from '@/core/components/Table/TableTBody.svelte';
 import TableTBodyTr from '@/core/components/Table/TableTBodyTr.svelte';
 import TableTBodyTd from '@/core/components/Table/TableTBodyTd.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
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
 <Input placeholder="Add sticker server address" grow={true} bind:value={addUrl} onKeydown={onKeydownAdd} bind:this={inputAdd} />
 <Button text="Add" onClick={clickAdd} />
</div>
<Table>
 <TableTHead>
  <TableTHeadTr>
   <TableTHeadTh>Sticker servers</TableTHeadTh>
   <TableTHeadTh>Action</TableTHeadTh>
  </TableTHeadTr>
 </TableTHead>
 <TableTBody>
  {#each $sticker_servers as s}
   <TableTBodyTr>
    <TableTBodyTd><a href={s} target="_blank">{s}</a></TableTBodyTd>
    <TableTBodyTd center={true}>
     <Icon img="img/del.svg" colorVariable="--icon-red" alt="Delete" size="20" padding="5" onClick={() => clickDel(s)} />
    </TableTBodyTd>
   </TableTBodyTr>
  {/each}
 </TableTBody>
</Table>
{#if error}
 <div class="error">{error}</div>
{/if}
