<script>
 import { onMount } from 'svelte';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 import { updateStickerLibrary } from '../messages.js';
 import StickerSet from './stickerset.svelte';
 import Button from '../../../core/components/button.svelte';
 const stickerServer = 'https://stickers.libersoft.org';
 let library = localStorageSharedStore('stickers', {});
 let filter;

 onMount(() => {
  if ($library[stickerServer] === undefined) updateStickerLibrary();
  filter.focus(); // TODO - not working, because it loads the element before it's shown in context menu
 });
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
  <div class="set">
   {#each $library[source_server] as stickerset}
    <StickerSet {stickerset} />
   {/each}
  </div>
 {/each}
</div>
