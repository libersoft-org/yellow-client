<script>
 import { onMount, tick } from 'svelte';
 import VirtualList from './virtual-list.svelte';
 //   import VirtualList from 'svelte-virtual-list-ce';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 import { updateStickerLibrary } from '../messages.js';
 import StickerSet from './stickerset.svelte';
 import Button from '../../../core/components/button.svelte';
 import InputTextButton from '../../../core/components/input-text-button.svelte';
 import Select from '../../../core/components/select.svelte';
 import Option from '../../../core/components/select-option.svelte';
 import Tabs from '../../../core/components/tabs.svelte';
 import Item from '../../../core/components/tabs-item.svelte';
 import TabSettings from './stickers-settings.svelte';
 import TabFavourites from './stickers-favourites.svelte';
 import TabServer from './stickers-server.svelte';
 import { liveQuery } from 'dexie';
 import { db } from '../db';
 import BaseButton from '../../../core/components/base-button.svelte';

 let stickerServer = 'https://stickers.libersoft.org';
 let filter;
 let activeTab = 'server';
 let count = 0;
 const tabs = {
  favourites: TabFavourites,
  settings: TabSettings,
  server: TabServer,
 };

 $: console.log('library filter:', filter);

 let library = liveQuery(() => db.stickersets.toArray());

 $: console.log('library: ', library);
 let start, end;
 $: count = $library?.length;

 onMount(async () => {
  //if ($library?.length === 0) await updateStickerLibrary(stickerServer);
  await tick();
 });

 function setTab(e, name) {
  activeTab = name;
 }

 async function clickUpdate() {
  await updateStickerLibrary(stickerServer);
 }

 function clickSearch() {
  console.log('Clicked on Search');
 }

 function onMousedown(event) {
  console.log('stickers mousedown');
  event.preventDefault();
  event.stopPropagation();
 }
</script>

<style>
 .stickers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /*padding: 10px;*/
 }

 .top-components {
  padding: 10px;
 }

 .filter {
  display: flex;
  gap: 10px;
 }

 .count {
  display: flex;
  justify-content: right;
  font-size: 13px;
 }
</style>

<div class="stickers" on:mousedown={onMousedown} on:click={onMousedown}>
 <div class="top-components">
  <Tabs>
   <Item img="modules/org.libersoft.messages/img/favourite.svg" active={activeTab === 'favourites'} onClick={e => setTab(e, 'favourites')} />
   <Item img="modules/org.libersoft.messages/img/server.svg" active={activeTab === 'server'} onClick={e => setTab(e, 'server')} />
   <Item img="modules/org.libersoft.messages/img/update.svg" onClick={clickUpdate} />
   <Item img="img/settings.svg" active={activeTab === 'settings'} onClick={e => setTab(e, 'settings')} />
  </Tabs>
  <svelte:component this={tabs[activeTab]} />
  <div class="filter">
   <InputTextButton img="modules/org.libersoft.messages/img/search.svg" alt="Search" placeholder="Search ..." bind:this={filter} />
   <Select>
    <Option value="0" text="All" />
    <Option value="1" text="Animated only" />
    <Option value="2" text="Static only" />
   </Select>
  </div>
  <div class="count">showing {start}-{end} of {count} sticker sets found</div>
 </div>
 {#if $library}
  <div style="height: 600px; max-height: 600px;">
   <VirtualList items={$library} let:item bind:start bind:end contents_styles={'display: flex; flex-direction: column; gap: 28px;'}>
    <StickerSet stickerset={item} />
   </VirtualList>
  </div>

  <!--   {#each $library as item}
    <StickerSet stickerset={item} />
   {/each}-->
 {/if}
</div>
