<script>
 import { identifier } from '../messages.js';
 import { onMount } from 'svelte';
 import { updateStickerLibrary, stickerLibraryUpdaterState } from '../stickers.js';

 import Tabs from '../../../core/components/tabs.svelte';
 import Item from '../../../core/components/tabs-item.svelte';
 import TabSettings from './stickers-settings.svelte';
 import TabFavourites from './stickers-favourites.svelte';
 import TabServer from './stickers-server.svelte';
 import ProgressBar from './progressbar.svelte';
 const tabs = {
  favourites: TabFavourites,
  settings: TabSettings,
  server: TabServer,
 };
 let activeTab = $state('server');

 onMount(async () => {
  //if ($library?.length === 0) await updateStickerLibrary();
 });

 function setTab(e, name) {
  activeTab = name;
 }

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
</style>

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
 </div>
 {#await tabs[activeTab] then Component}<Component />{/await}
</div>
