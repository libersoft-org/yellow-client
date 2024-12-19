<script>
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';

 import StickerSet from './stickerset.svelte';
 import { onMount } from 'svelte';

 let library = localStorageSharedStore('stickers', {});

 const yellow_stickers_server = 'https://stickers.libersoft.org';

 onMount(() => {
  console.log('loading stickers from ' + yellow_stickers_server);

  let start_fetch_sets = Date.now();
  fetch(yellow_stickers_server + '/api/sets')
   .then(response => response.json())
   .then(sets => {
    console.log('discovered ' + sets.length + ' sticker sets in ' + (Date.now() - start_fetch_sets) + 'ms');
    sets.forEach(set => {
     console.log('details for set ' + set.id);
     fetch(yellow_stickers_server + '/api/stickers?id=' + set.id)
      .then(response => response.json())
      .then(stickers => {
       console.log('loaded ' + stickers.length + ' details for set ' + set.id + ' after ' + (Date.now() - start_fetch_sets) + 'ms');
       set.items = stickers;
       set.items.forEach(sticker => {
        sticker.url = yellow_stickers_server + '/download/' + set.id + '/' + sticker.name;
       });
       library.update(d => d);
      });
    });

    library.update(d => {
     d[yellow_stickers_server] = sets;
     return d;
    });
   });
 });
</script>

<style>
 .stickers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  /*max-width: 420px;*/
 }

 .stickers .label {
  font-weight: bold;
 }

 .stickers .set {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
 }
</style>

<div class="stickers">
 {#each Object.keys($library) as source_server}
  <b>{source_server}</b>
  <div>
   {#each $library[source_server] as stickerset}
    <StickerSet {stickerset} />
   {/each}
  </div>
 {/each}
</div>
