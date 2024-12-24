<script>
 import { onMount } from 'svelte';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 import { updateStickerLibrary } from '../messages.js';
 import StickerSet from './stickerset.svelte';
 import Button from '../../../core/components/button.svelte';
 const library = localStorageSharedStore('stickers', {});
 let stickerServer = 'https://stickers.libersoft.org';
 let filter;

 onMount(async () => {
  if ($library[stickerServer] === undefined) await updateStickerLibrary(library, stickerServer);
  filter.focus(); // TODO - not working, because it loads the element before it's shown in context menu
 });

 function clickUpdate() {
  updateStickerLibrary(library, stickerServer);
 }

 function clickSearch() {
  console.log('Clicked on search');
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
 <div class="group">
  <div class="label">Sticker server:</div>
  <input type="text" bind:value={stickerServer} />
  <Button on:click={clickUpdate}>Update</Button>
 </div>
 <div class="group">
  <div class="label">Filter:</div>
  <input type="text" bind:this={filter} />
  <Button on:click={clickSearch}>Search</Button>
 </div>
 {#if library}
  <div class="set">
   {#each $library[stickerServer] as stickerset}
    <StickerSet {stickerset} />
   {/each}
  </div>
 {/if}
</div>
