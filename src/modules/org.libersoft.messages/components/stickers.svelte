<script>
 import { identifier } from '../messages.js';
 import { onMount, tick } from 'svelte';
 import { updateStickerLibrary, stickerLibraryUpdaterState } from '../stickers.js';
 import { debug } from '../../../core/core.js';

 import Tabs from '../../../core/components/tabs.svelte';
 import Item from '../../../core/components/tabs-item.svelte';
 import TabSettings from './stickers-settings.svelte';
 import StickersFavorites from './stickers-favorites.svelte';
 import TabServer from './stickers-server.svelte';
 import ProgressBar from './progressbar.svelte';
 const tabs = {
  favorites: StickersFavorites,
  settings: TabSettings,
  server: TabServer,
 };
 let activeTabName = $state('server');
 let view;

 async function setTab(e, name) {
  activeTabName = name;
  await tick();
  view.onShow?.();
 }

 onMount(async () => {
  await setTab(null, activeTabName);
 });

 async function clickUpdate() {
  await updateStickerLibrary();
 }
</script>

<style>
 .stickers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(100% - 45px);
  overflow: hidden;
  padding: 10px 10px 0px 10px;
 }

 .top-components {
  display: flex;
  flex-direction: column;
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

 .loading .error {
  border: 1px solid red;
 }
</style>

<div class="stickers">
 <div class="top-components">
  <Tabs>
   <Item active={activeTabName === 'favourites'} img="modules/{identifier}/img/favourite.svg" onClick={e => setTab(e, 'favorites')} />
   <Item active={activeTabName === 'server'} img="modules/{identifier}/img/server.svg" onClick={e => setTab(e, 'server')} />
   <Item img="modules/{identifier}/img/update{$stickerLibraryUpdaterState.updating ? '-disabled' : ''}.svg" onClick={clickUpdate} />
   <Item active={activeTabName === 'settings'} img="img/settings.svg" onClick={e => setTab(e, 'settings')} />
  </Tabs>
  {#if $debug}$stickerLibraryUpdaterState{/if}
  {#if $stickerLibraryUpdaterState.updating}
   <div class="loading">
    <div class="status">{$stickerLibraryUpdaterState.status}</div>
    <ProgressBar value={$stickerLibraryUpdaterState.progress} color="#db0" moving={true} />
   </div>
  {/if}
  {#if $stickerLibraryUpdaterState.error}
   <div class="loading">
    <div class="status error">Error: {$stickerLibraryUpdaterState.status}</div>
   </div>
  {/if}
 </div>
 {#await tabs[activeTabName] then Component}<Component bind:this={view} />{/await}
</div>
