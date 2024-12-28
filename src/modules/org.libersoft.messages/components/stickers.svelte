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
 let fulltext_search_filter = '';
 let animated_filter;
 let animated_filter_dropdown_value = '0';
 $: animated_filter = animated_filter_dropdown_value === '0' ? [true, false] : animated_filter_dropdown_value === '1' ? [true] : [false];

 let activeTab = 'server';
 let count = 0;
 const tabs = {
  favourites: TabFavourites,
  settings: TabSettings,
  server: TabServer,
 };

 $: console.log('library filter:', fulltext_search_filter);

 let search_results;

 $: search_results = liveQuery(() => db.stickersets.where('title').startsWithIgnoreCase(fulltext_search_filter).toArray());

 let start, end;
 $: count = $search_results?.length;

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
  overflow: hidden;
  max-height: calc(100% - 39px);
 }

 .top-components {
  padding: 10px;
 }

 .stickersets {
  display: flex;
  flex-direction: column;
  overflow: auto;
  gap: 10px;
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

<!--
<div class="stickers" role="none" on:mousedown={onMousedown} on:click={onMousedown} on:keydown={onMousedown}>
-->
<div class="stickers">
 <div class="top-components">
  <Tabs>
   <Item img="modules/org.libersoft.messages/img/favourite.svg" active={activeTab === 'favourites'} onClick={e => setTab(e, 'favourites')} />
   <Item img="modules/org.libersoft.messages/img/server.svg" active={activeTab === 'server'} onClick={e => setTab(e, 'server')} />
   <Item img="modules/org.libersoft.messages/img/update.svg" onClick={clickUpdate} />
   <Item img="img/settings.svg" active={activeTab === 'settings'} onClick={e => setTab(e, 'settings')} />
  </Tabs>
  <svelte:component this={tabs[activeTab]} />
  <div class="filter">
   <InputTextButton img="modules/org.libersoft.messages/img/search.svg" alt="Search" placeholder="Search ..." bind:this={fulltext_search_filter} />
   <Select bind:this={animated_filter_dropdown_value}>
    <Option value="all" text="All" />
    <Option value="animated" text="Animated only" />
    <Option value="static" text="Static only" />
   </Select>
  </div>
  <div class="count">showing {start}-{end} of {count} sticker sets found</div>
 </div>
 {#if $search_results}
  <div class="stickersets">
   <VirtualList items={$search_results} let:item bind:start bind:end contents_styles={'display: flex; flex-direction: column; gap: 28px;'}>
    <StickerSet stickerset={item} />
   </VirtualList>
   <!--
   {#each $library as item}
    <StickerSet stickerset={item} />
   {/each}
-->
  </div>
 {/if}
</div>
