<script lang="ts">
 import { gif_servers } from '../gifs.js';
 import Input from '@/core/components/Input/Input.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import Table from '@/core/components/ResponsiveTable/Table.svelte';
 import THead from '@/core/components/ResponsiveTable/THead.svelte';
 import THeadTr from '@/core/components/ResponsiveTable/THeadTr.svelte';
 import THeadTh from '@/core/components/ResponsiveTable/THeadTh.svelte';
 import TBody from '@/core/components/ResponsiveTable/TBody.svelte';
 import TBodyTr from '@/core/components/ResponsiveTable/TBodyTr.svelte';
 import TBodyTd from '@/core/components/ResponsiveTable/TBodyTd.svelte';

 let inputElement: typeof Input.prototype;
 let addUrl = $state('');
 let error = $state('');

 $effect(() => {
  if (inputElement) inputElement.focus();
 });

 function onKeydownAdd(e) {
  if (e.key === 'Enter') clickAdd();
 }

 function clickAdd() {
  gif_servers.update(s => {
   s.push(addUrl);
   return s;
  });
  addUrl = '';
  inputElement.focus();
 }

 function clickDel(url) {
  console.log('Click - Delete: ' + url);
  gif_servers.update(servers => {
   return servers.filter(s => s !== url);
  });
  inputElement.focus();
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
 <Input placeholder="Add gif server address" grow={true} bind:value={addUrl} onKeydown={onKeydownAdd} bind:this={inputElement} />
 <Button text="Add" onClick={clickAdd} />
</div>

<Table breakpoint="0">
 <THead>
  <THeadTr>
   <THeadTh>Gif servers:</THeadTh>
   <THeadTh>Action:</THeadTh>
  </THeadTr>
 </THead>
 <TBody>
  {#each $gif_servers as s}
   <TBodyTr>
    <TBodyTd title="Gif servers">
     <a href={s} target="_blank">{s}</a>
    </TBodyTd>
    <TBodyTd title="Action">
     <Icon img="img/del.svg" colorVariable="--icon-red" alt="Delete" size="20px" padding="5px" onClick={() => clickDel(s)} />
    </TBodyTd>
   </TBodyTr>
  {/each}
 </TBody>
</Table>
{#if error}
 <div class="error">{error}</div>
{/if}
