<script>
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 import Button from '../../../core/components/button.svelte';
 import StickerSet from './stickerset.svelte';
 import { onMount } from 'svelte';
 import { get } from 'svelte/store';

 let library = localStorageSharedStore('stickers', {});
 const yellow_stickers_server = 'https://stickers.libersoft.org';
 onMount(() => {
  //setInterval(update_sticker_library, 1000 * 60 * 5);
  if (get(library)[yellow_stickers_server] === undefined) {
   update_sticker_library();
  }
 });

 async function update_sticker_library() {
  console.log('loading list of stickersets from ' + yellow_stickers_server);
  let start_fetch_sets = Date.now();
  let response = await fetch(yellow_stickers_server + '/api/sets');
  response = await response.json();
  let sets = response.data;
  console.log('discovered ' + sets.length + ' stickersets in ' + (Date.now() - start_fetch_sets) + 'ms');
  sets.forEach(stickerset => {
   console.log('fetch details for stickerset ' + stickerset.id);
   let stickerset_url = yellow_stickers_server + '/api/stickers?id=' + stickerset.id;
   fetch(stickerset_url)
    .then(response => response.json())
    .then(stickerset_response => {
     console.log('loaded ', stickerset_response);
     stickerset.url = stickerset_url;
     let stickers = stickerset_response.data.stickers;
     console.log('loaded ' + stickers.length + ' details for stickerset ' + stickerset.id + ' after ' + (Date.now() - start_fetch_sets) + 'ms');
     stickerset.items = stickers;
     stickerset.items.forEach(sticker => {
      sticker.stickerset = stickerset_url;
      sticker.url = yellow_stickers_server + '/download/' + stickerset.id + '/' + sticker.name;
     });
     library.update(d => d);
    });
  });
  library.update(d => {
   d[yellow_stickers_server] = sets;
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
  max-width: 420px;
 }
</style>

<div class="stickers">
 <Button on:click={update_sticker_library}>Update</Button>
 {#each Object.keys($library) as source_server}
  <b>{source_server}</b>
  <div>
   {#each $library[source_server] as stickerset}
    <StickerSet {stickerset} />
   {/each}
  </div>
 {/each}
</div>
