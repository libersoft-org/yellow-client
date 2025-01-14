<script>
 import { debug } from '../../../core/core.js';
 import { identifier } from '../messages.js';
 import FuzzySearch from 'fuzzy-search';
 import { onMount } from 'svelte';
 import { writable } from 'svelte/store';
 import { updateStickerLibrary, stickerLibraryUpdaterState } from '../stickers.js';
 import StickersSearchResults from './stickers-search-results.svelte';
 import InputTextButton from '../../../core/components/input-text-button.svelte';
 import Select from '../../../core/components/select.svelte';
 import Option from '../../../core/components/select-option.svelte';
 import Tabs from '../../../core/components/tabs.svelte';
 import Item from '../../../core/components/tabs-item.svelte';
 import TabSettings from './stickers-settings.svelte';
 import TabFavourites from './stickers-favourites.svelte';
 import TabServer from './stickers-server.svelte';
 import ProgressBar from './progressbar.svelte';
 import { liveQuery } from 'dexie';
 import { db } from '../db';
 const tabs = {
  favourites: TabFavourites,
  settings: TabSettings,
  server: TabServer,
 };
 let activeTab = $state('server');
 let stickerServer = 'https://stickers.libersoft.org';
 let fulltext_search_filter = $state('');
 let animated_filter_dropdown_value = $state('all');
 let scroll_to_top = $state(null);
 $effect(() => console.log('animated_filter_dropdown_value:', animated_filter_dropdown_value));
 let animated_filter = $derived(animated_filter_dropdown_value === 'all' ? [1, 0] : animated_filter_dropdown_value === 'animated' ? [1] : [0]);
 let count;
 let items = writable([]);
 items.subscribe(value => console.log('Stickers.svelte items:', value));
 //$inspect($items, count);
 let query_store_unsubscribe;
 $effect(async () => live_query(fulltext_search_filter, animated_filter));
 async function live_query(fulltext_search_filter, animated_filter) {
  console.log('scroll_to_top:', scroll_to_top);
  await scroll_to_top();
  console.log('update_live_query', fulltext_search_filter, animated_filter);
  console.log('typeof fulltext_search_filter:', typeof fulltext_search_filter);
  let query_store = liveQuery(async () => {
   let x = db.stickersets;
   void 'x is now a dexie Table. We have one shot at ordering or filtering it at the db level: https://dexie.org/docs/Dexie/Dexie.[table]';
   x = x.orderBy('id');
   void "x is now a Dexie Collection. We can now filter, sort and limit it further, but it's a different api: https://dexie.org/docs/Collection/Collection";
   x = x.filter(item => animated_filter.includes(item.animated ? 1 : 0));
   x = await x.toArray();
   void 'x is now an array of items. We can apply additional filtering, sorting and limiting on it using js.';
   if (fulltext_search_filter != '') {
    fulltext_search_filter = fulltext_search_filter.toLowerCase();
    x = new FuzzySearch(x, ['name'], { caseSensitive: false, sort: true }).search(fulltext_search_filter);
   }
   return x;
  });
  if (query_store_unsubscribe) query_store_unsubscribe.unsubscribe();
  query_store_unsubscribe = query_store.subscribe(value => {
   items.set(value);
   count = value.length;
  });
  return query_store;
 }
 $effect(() => console.log('Stickers.svelte items $effect:', $items));
 let start, end;

 onMount(async () => {
  //if ($library?.length === 0) await updateStickerLibrary(stickerServer);
 });

 function setTab(e, name) {
  activeTab = name;
 }

 async function clickUpdate() {
  await updateStickerLibrary(stickerServer);
 }
</script>

<style>
 .stickers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(100% - 45px);
  overflow: hidden;
 }

 .top-components {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 10px 0px 10px;
 }

 .filter {
  display: flex;
  gap: 10px;
 }

 .loading {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .loading .status {
  font-size: 14px;
 }

 /*
 .count {
  display: flex;
  justify-content: right;
  font-size: 13px;
 }*/
</style>

<!--
<div class="stickers" role="none" on:mousedown={onMousedown} on:click={onMousedown} on:keydown={onMousedown}>
-->
<div class="stickers">
 <div class="top-components">
  <Tabs>
   <Item active={activeTab === 'favourites'} img="modules/{identifier}/img/favourite.svg" onClick={e => setTab(e, 'favourites')} />
   <Item active={activeTab === 'server'} img="modules/{identifier}/img/server.svg" onClick={e => setTab(e, 'server')} />
   <Item img="modules/{identifier}/img/update.svg" onClick={clickUpdate} />
   <Item active={activeTab === 'settings'} img="img/settings.svg" onClick={e => setTab(e, 'settings')} />
  </Tabs>
  {#if $stickerLibraryUpdaterState.updating}
   <div class="loading">
    <div class="status">{$stickerLibraryUpdaterState.status}</div>
    <ProgressBar value={$stickerLibraryUpdaterState.progress} color="#db0" moving={true} />
   </div>
  {/if}
  <!--<svelte:component this={tabs[activeTab]} /> --- Svelte 4 -->
  {#await tabs[activeTab] then Component}
   <!-- Svelte 5 -->
   <Component />
  {/await}
  <div class="filter">
   <InputTextButton alt="Search" bind:value={fulltext_search_filter} img="modules/{identifier}/img/search.svg" placeholder="Search ..." />
   <Select bind:value={animated_filter_dropdown_value}>
    <Option text="All" value="all" />
    <Option text="Animated only" value="animated" />
    <Option text="Static only" value="static" />
   </Select>
  </div>
  <!--
  <div class="count">showing {start}-{end} of {count} sticker sets found</div>
-->
 </div>
 {#if $debug}
  animated_filter: {JSON.stringify(animated_filter)}
  fulltext_search_filter: {JSON.stringify(fulltext_search_filter)}
  $items.length: {$items.length}
 {/if}
 <StickersSearchResults bind:scroll_to_top items={$items} />
</div>
