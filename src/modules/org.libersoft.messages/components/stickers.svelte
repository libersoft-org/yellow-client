<script>
 import { onMount } from 'svelte';
 import { get } from 'svelte/store';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 import StickerSet from './stickerset.svelte';
 import Button from '../../../core/components/button.svelte';
 const stickerServer = 'https://stickers.libersoft.org';
 let library = localStorageSharedStore('stickers', {});
 let filter;

 onMount(() => {
  if (get(library)[stickerServer] === undefined) updateStickerLibrary();
  filter.focus(); // TODO - not working, because it loads the element before it's shown in context menu
 });

 async function updateStickerLibrary() {
  console.log('loading list of stickersets from ' + stickerServer);
  let startFetchSets = Date.now();
  let response = await fetch(stickerServer + '/api/sets');
  response = await response.json();
  let sets = response.data;
  console.log('discovered ' + sets.length + ' stickersets in ' + (Date.now() - startFetchSets) + 'ms');
  sets = sets.slice(0, 10);
  sets.forEach(stickerset => {
   console.log('fetch details for stickerset ' + stickerset.id);
   let stickerset_url = stickerServer + '/api/stickers?id=' + stickerset.id;
   fetch(stickerset_url)
    .then(response => response.json())
    .then(stickerset_response => {
     console.log('loaded ', stickerset_response);
     stickerset.url = stickerset_url;
     let stickers = stickerset_response.data.stickers;
     console.log('loaded ' + stickers.length + ' details for stickerset ' + stickerset.id + ' after ' + (Date.now() - startFetchSets) + 'ms');
     stickerset.items = stickers;
     stickerset.items.forEach(sticker => {
      sticker.stickerset = stickerset_url;
      sticker.url = stickerServer + '/download/' + (stickerset.animated ? 'animated' : 'static') + '/' + stickerset.alias + '/' + sticker.name;
     });
     library.update(d => d);
    });
  });
  library.update(d => {
   d[stickerServer] = sets;
   return d;
  });
 }
</script>

<style>
 .stickers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
 }

 .group {
  display: flex;
  align-items: center;
  gap: 10px;
 }

 .group .label {
  font-weight: bold;
 }

 .group input {
  width: 10px;
  padding: 10px;
  border: 1px solid #000;
  flex-grow: 1;
  border-radius: 10px;
 }
</style>

<div class="stickers">
 {#each Object.keys($library) as source_server}
  <div class="group">
   <div class="label">Sticker server:</div>
   <input type="text" value={source_server} />
   <Button on:click={updateStickerLibrary}>Update</Button>
  </div>
  <div class="group">
   <div class="label">Filter:</div>
   <input type="text" bind:this={filter} />
   <Button on:click={updateStickerLibrary}>Search</Button>
  </div>
  <div>
   {#each $library[source_server] as stickerset}
    <StickerSet {stickerset} />
   {/each}
  </div>
 {/each}
</div>
