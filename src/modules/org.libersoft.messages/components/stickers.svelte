<script>
 import { levenshteinEditDistance } from 'levenshtein-edit-distance';
 import { fuzzySearch } from 'levenshtein-search';
 import { onMount, tick } from 'svelte';
 import { get, writable } from 'svelte/store';
 import { updateStickerLibrary } from '../messages.js';
 import VirtualList from './virtual-list.svelte';
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
 let animated_filter_dropdown_value = $state('all');

 let scroll_to_top;

 $effect(() => {
  console.log('animated_filter_dropdown_value:', animated_filter_dropdown_value);
 });
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

   x = x.where('animated').anyOf(animated_filter);
   //x = x.limit(1000);

   //x = x.sortBy('id');

   /*
   if (fulltext_search_filter != '') {
    fulltext_search_filter = fulltext_search_filter.toLowerCase();
    //x = x.where('name').startsWithIgnoreCase(fulltext_search_filter);
    //x = x.sortBy('name', name => 3/!*levenshteinEditDistance(name.toLowerCase(), fulltext_search_filter)*!/);
    x = x.sortBy('name', name => true);
    //x = x .and(item => /foo/i.test(friend.name));
    //x = x .and(item => levenshtein(item.name.toLowerCase(), fulltext_search_filter.toLowerCase()) < 2);
    //x = x .and(item => item.name.toLowerCase().includes(fulltext_search_filter.toLowerCase()));
   }
*/

   if (fulltext_search_filter != '') {
    fulltext_search_filter = fulltext_search_filter.toLowerCase();
    let result = await x.toArray();
    result = result.sort((a, b) => levenshteinEditDistance(a.name.toLowerCase(), fulltext_search_filter) - levenshteinEditDistance(b.name.toLowerCase(), fulltext_search_filter));
    return result;
   } else {
    return await x.toArray();
   }

   console.log('x:', x);
   let result = x.toArray();
   console.log('result:', result);
   return result;
  });

  if (query_store_unsubscribe) {
   query_store_unsubscribe.unsubscribe();
  }

  query_store_unsubscribe = query_store.subscribe(value => {
   console.log('query_store value:', value);
   console.log('global items is now, ', $items);
   items.set(value);
   console.log('now global items is, ', $items);
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
  padding: 10px;
 }

 .filter {
  display: flex;
  gap: 10px;
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
   <Item active={activeTab === 'favourites'} img="modules/org.libersoft.messages/img/favourite.svg" onClick={e => setTab(e, 'favourites')} />
   <Item active={activeTab === 'server'} img="modules/org.libersoft.messages/img/server.svg" onClick={e => setTab(e, 'server')} />
   <Item img="modules/org.libersoft.messages/img/update.svg" onClick={clickUpdate} />
   <Item active={activeTab === 'settings'} img="img/settings.svg" onClick={e => setTab(e, 'settings')} />
  </Tabs>
  <!--<svelte:component this={tabs[activeTab]} /> --- Svelte 4 -->
  {#await tabs[activeTab] then Component}
   <!-- Svelte 5 -->
   <Component />
  {/await}
  <div class="filter">
   <InputTextButton alt="Search" bind:value={fulltext_search_filter} img="modules/org.libersoft.messages/img/search.svg" placeholder="Search ..." />
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

 animated_filter: {JSON.stringify(animated_filter)}
 fulltext_search_filter: {JSON.stringify(fulltext_search_filter)}
 $items.length: {$items.length}

 <StickersSearchResults bind:scroll_to_top items={$items} />
</div>
