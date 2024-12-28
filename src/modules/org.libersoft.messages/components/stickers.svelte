<script>
 import { onMount, tick } from 'svelte';
 import { get } from 'svelte/store';
 import { updateStickerLibrary } from '../messages.js';
 import StickersSearchResults from './stickers-search-results.svelte';
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

 const tabs = {
  favourites: TabFavourites,
  settings: TabSettings,
  server: TabServer,
 };

 let activeTab = $state('server');
 let stickerServer = 'https://stickers.libersoft.org';

 let fulltext_search_filter = $state('');
 let animated_filter_dropdown_value = $state('0');
 let animated_filter = $derived(animated_filter_dropdown_value === '0' ? [1, 0] : animated_filter_dropdown_value === '1' ? [1] : [0]);
 let count = $derived(get(query_store)?.length);
 let query_store = $derived(live_query(fulltext_search_filter, animated_filter));
 $effect(() => {
  console.log('query_store:', query_store, get(query_store));
 });

 function live_query(fulltext_search_filter, animated_filter) {
  console.log('update_live_query', fulltext_search_filter, animated_filter);
  console.log('typeof fulltext_search_filter:', typeof fulltext_search_filter);

  return liveQuery(() => {
   let x = db.stickersets;
   //x = x.where('animated').anyOf(animated_filter);
   if (fulltext_search_filter != '') {
    //x = x.where('title').startsWithIgnoreCase(fulltext_search_filter);
    //x = x .and(item => /foo/i.test(friend.name));
    //x = x .and(item => levenshtein(item.name.toLowerCase(), fulltext_search_filter.toLowerCase()) < 2);
    //x = x .and(item => item.name.toLowerCase().includes(fulltext_search_filter.toLowerCase()));
   }
   let result = x.toArray();
   console.log('result:', result);
   return result;
  });
 }

 let start, end;

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
   <InputTextButton img="modules/org.libersoft.messages/img/search.svg" alt="Search" placeholder="Search ..." bind:value={fulltext_search_filter} />
   <Select bind:this={animated_filter_dropdown_value}>
    <Option value="all" text="All" />
    <Option value="animated" text="Animated only" />
    <Option value="static" text="Static only" />
   </Select>
  </div>
  <div class="count">showing {start}-{end} of {count} sticker sets found</div>
 </div>
 {#if query_store}
  <StickersSearchResults items={query_store} />
 {/if}
</div>
