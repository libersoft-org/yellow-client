<script>
 import { onMount, getContext } from 'svelte';
 import BaseButton from '../../../core/components/base-button.svelte';
 import Button from '../../../core/components/button.svelte';
 import InputText from '../../../core/components/input-text.svelte';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 const MessageBar = getContext('MessageBar');
 const store = localStorageSharedStore('giphy-api-key');
 let apiKey;
 let gifs = [];
 let query = '';
 let loading = false;

 onMount(() => {
  apiKey = $store;
 });

 function saveAPIKey() {
  store.set(apiKey);
 }

 function keySaveAPIKey(e) {
  if (e.detail.key === 'Enter') saveAPIKey();
 }

 async function getGifs() {
  if (!query) return;
  loading = true;
  try {
   const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${query}&limit=12&offset=0&rating=r&lang=en&bundle=messaging_non_clips`);
   console.log(response);
   if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
   const data = await response.json();
   gifs = data.data.map(gif => gif.images.fixed_height.url);
  } catch (err) {
   console.error('Error while loading GIFs from server:', err);
  } finally {
   loading = false;
  }
 }

 function keyGetGifs(e) {
  if (e.detail.key === 'Enter') getGifs();
 }

 function sendGIF(url) {
  MessageBar.sendMessage('<div style="display: flex; border-radius: 10px; overflow: hidden;"><img src="' + url + '" alt="GIF" /></div>');
  MessageBar.setBarFocus();
  // TODO - close expressions
 }
</script>

<style>
 .gifset {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  height: calc(100% - 45px);
 }

 .group {
  display: flex;
  gap: 10px;
 }

 .container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
  overflow: auto;
 }

 .container img {
  width: 160px;
  height: 160px;
  object-fit: contain;
 }

 .item {
  border-radius: 5px;
  overflow: hidden;
 }
</style>

<div class="gifset">
 <div class="group">
  <InputText placeholder="Your Giphy API key" bind:value={apiKey} on:keydown={keySaveAPIKey} />
  <Button text="Save" onClick={saveAPIKey} />
 </div>
 <div class="group">
  <InputText placeholder="Search GIFs" bind:value={query} on:keydown={keyGetGifs} />
  <Button text="Search" onClick={getGifs} />
 </div>
 {#if loading}
  <div>Loading...</div>
 {:else if gifs.length === 0 && query}
  <div>No GIFs found.</div>
 {:else}
  <div class="container">
   {#each gifs as gif}
    <BaseButton onClick={() => sendGIF(gif)}>
     <div class="item"><img src={gif} alt="GIF" /></div>
    </BaseButton>
   {/each}
  </div>
 {/if}
</div>
