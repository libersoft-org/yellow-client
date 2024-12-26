<script>
 import { onMount } from 'svelte';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 import { updateStickerLibrary } from '../messages.js';
 import StickerSet from './stickerset.svelte';
 import Button from '../../../core/components/button.svelte';
 import InputButton from '../../../core/components/input-button.svelte';
 import Select from '../../../core/components/select.svelte';
 import Option from '../../../core/components/select-option.svelte';
 import Tabs from '../../../core/components/tabs.svelte';
 import Item from '../../../core/components/tabs-item.svelte';
 import TabSettings from './stickers-settings.svelte';
 import TabFavourites from './stickers-favourites.svelte';
 import TabServer from './stickers-server.svelte';
 const library = localStorageSharedStore('stickers', {});
 let stickerServer = 'https://stickers.libersoft.org';
 let filter;
 let activeTab = 'server';
 let count = 0;
 const tabs = {
  favourites: TabFavourites,
  settings: TabSettings,
  server: TabServer,
 };

 onMount(async () => {
  if ($library[stickerServer] === undefined) await updateStickerLibrary(library, stickerServer);
  //filter.focus(); // TODO - not working, because it loads the element before it's shown in context menu
  count = $library[stickerServer].length;
 });

 function setTab(e, name) {
  activeTab = name;
 }

 function clickUpdate() {
  updateStickerLibrary(library, stickerServer);
 }

 function clickSearch() {
  console.log('Clicked on Search');
 }
</script>

<style>
 .stickers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
 }

 .set {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

<div class="stickers">
 <Tabs>
  <Item img="modules/org.libersoft.messages/img/favourite.svg" active={activeTab === 'favourites'} onClick={e => setTab(e, 'favourites')} />
  <Item img="modules/org.libersoft.messages/img/server.svg" active={activeTab === 'server'} onClick={e => setTab(e, 'server')} />
  <Item img="modules/org.libersoft.messages/img/update.svg" onClick={clickUpdate} />
  <Item img="img/settings.svg" active={activeTab === 'settings'} onClick={e => setTab(e, 'settings')} />
 </Tabs>
 <svelte:component this={tabs[activeTab]} />
 <div class="filter">
  <InputButton img="modules/org.libersoft.messages/img/search.svg" alt="Search" placeholder="Search ..." bind:this={filter} />
  <Select>
   <Option value="0" text="All" />
   <Option value="1" text="Animated only" />
   <Option value="2" text="Static only" />
  </Select>
 </div>
 <div class="count">Found {count} sticker sets</div>
 {#if library}
  <div class="set">
   {#each $library[stickerServer] as stickerset}
    <StickerSet {stickerset} />
   {/each}
  </div>
 {/if}
</div>
