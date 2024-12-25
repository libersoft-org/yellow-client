<script>
 import { onMount } from 'svelte';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 import { updateStickerLibrary } from '../messages.js';
 import StickerSet from './stickerset.svelte';
 import Button from '../../../core/components/button.svelte';
 import Tabs from './stickers-tabs.svelte';
 import Item from './stickers-tabs-item.svelte';
 import TabSettings from './stickers-settings.svelte';
 import TabFavourites from './stickers-favourites.svelte';
 import TabServer from './stickers-server.svelte';
 const library = localStorageSharedStore('stickers', {});
 let stickerServer = 'https://stickers.libersoft.org';
 let filter;
 let activeTab = 'server';
 const tabs = {
  favourites: TabFavourites,
  settings: TabSettings,
  server: TabServer,
 };

 onMount(async () => {
  if ($library[stickerServer] === undefined) await updateStickerLibrary(library, stickerServer);
  filter.focus(); // TODO - not working, because it loads the element before it's shown in context menu
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
</style>

<div class="stickers">
 <Tabs>
  <Item img="modules/org.libersoft.messages/img/favourite.svg" active={activeTab === 'favourites'} onClick={e => setTab(e, 'favourites')} />
  <Item img="modules/org.libersoft.messages/img/server.svg" active={activeTab === 'server'} onClick={e => setTab(e, 'server')} />
  <Item img="modules/org.libersoft.messages/img/update.svg" onClick={clickUpdate} />
  <Item img="img/settings.svg" active={activeTab === 'settings'} onClick={e => setTab(e, 'settings')} />
 </Tabs>
 <svelte:component this={tabs[activeTab]} />
 <div class="group">
  <input type="text" bind:this={filter} />
  <Button text="Search" on:click={clickSearch} />
 </div>
 {#if library}
  <div class="set">
   {#each $library[stickerServer] as stickerset}
    <StickerSet {stickerset} />
   {/each}
  </div>
 {/if}
</div>
