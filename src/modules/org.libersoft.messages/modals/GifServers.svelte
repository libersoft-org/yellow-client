<script>
 import { gif_servers } from '../gifs.js';
 import Input from '@/core/components/Input/Input.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import Table from '@/core/components/Table/Table.svelte';
 import Thead from '@/core/components/Table/TableThead.svelte';
 import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
 import Th from '@/core/components/Table/TableTheadTh.svelte';
 import Tbody from '@/core/components/Table/TableTbody.svelte';
 import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
 import Td from '@/core/components/Table/TableTbodyTd.svelte';
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
  gif_servers.update(s => {
   s.push(addUrl);
   return s;
  });
  addUrl = '';
  inputAdd.focus();
 }

 function clickDel(url) {
  console.log('Click - Delete: ' + url);
  gif_servers.update(servers => {
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
 <Input placeholder="Add gif server address" grow={true} bind:value={addUrl} onKeydown={onKeydownAdd} bind:this={inputAdd} />
 <Button text="Add" onClick={clickAdd} />
</div>
<Table>
 <Thead>
  <TheadTr>
   <Th>Gif servers</Th>
   <Th>Action</Th>
  </TheadTr>
 </Thead>
 <Tbody>
  {#each $gif_servers as s}
   <TbodyTr>
    <Td><a href={s} target="_blank">{s}</a></Td>
    <Td center={true}>
     <Icon img="img/del.svg" colorVariable="--icon-red" alt="Delete" size="20px" padding="5px" onClick={() => clickDel(s)} />
    </Td>
   </TbodyTr>
  {/each}
 </Tbody>
</Table>
{#if error}
 <div class="error">{error}</div>
{/if}
