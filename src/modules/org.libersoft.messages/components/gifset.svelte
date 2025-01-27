<script>
 import { onMount, getContext } from 'svelte';
 import { htmlEscape } from '../messages.js';
 import BaseButton from '../../../core/components/base-button.svelte';
 import Button from '../../../core/components/button.svelte';
 import InputText from '../../../core/components/input-text.svelte';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 const MessageBar = getContext('MessageBar');
 const menu = getContext('ContextMenu');
 const store = localStorageSharedStore('giphy-api-key');
 let apiKey;
 let gifs = [];
 let query = '';
 let loading = false;
 let elApiKey;
 let elSearchText;

 onMount(() => {
  apiKey = $store;
  if (!apiKey) elApiKey.focus();
  else elSearchText.focus();
 });

 function saveAPIKey() {
  store.set(apiKey);
 }

 function keySaveAPIKey(e) {
  if (e.key === 'Enter') saveAPIKey();
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
  if (e.key === 'Enter') getGifs();
 }

 function sendGIF(url) {
  MessageBar.sendMessagePlain('<Gif file="' + htmlEscape(url) + '" alt="GIF (animated picture)" />');
  menu?.close();
 }
</script>

<style>
 .gifset {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(100% - 45px);
 }

 .top-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
 }

 .group {
  display: flex;
  gap: 10px;
 }

 .results {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  overflow: auto;
  padding: 10px;
 }

 .results img {
  width: 160px;
  height: 160px;
  object-fit: contain;
 }

 .item {
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
  background-color: #eee;
  transition:
   transform 0.3s ease,
   box-shadow 0.3s ease;
 }

 .item:hover {
  z-index: 90;
  transform: scale(1.2);
 }
</style>

<div class="gifset">
 <div class="top-bar">
  <div class="group">
   <InputText placeholder="Your Giphy API key" grow={true} bind:this={elApiKey} bind:value={apiKey} onKeydown={keySaveAPIKey} />
   <Button text="Save" width="80px" onClick={saveAPIKey} />
  </div>
  <div class="group">
   <InputText placeholder="Search GIFs" grow={true} bind:this={elSearchText} bind:value={query} onKeydown={keyGetGifs} />
   <Button text="Search" width="80px" onClick={getGifs} />
  </div>
 </div>
 <div class="results">
  {#if loading}
   <div>Loading...</div>
  {:else if gifs.length === 0 && query}
   <div>No GIFs found.</div>
  {:else}
   {#each gifs as gif}
    <BaseButton onClick={() => sendGIF(gif)}>
     <div class="item">
      <img src={gif} alt="GIF" />
     </div>
    </BaseButton>
   {/each}
  {/if}
 </div>
</div>
