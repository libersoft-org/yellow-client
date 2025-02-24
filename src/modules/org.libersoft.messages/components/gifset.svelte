<script>
 import { get } from 'svelte/store';
 import { onMount, getContext } from 'svelte';
 import { htmlEscape } from '../messages.js';
 import BaseButton from '../../../core/components/base-button.svelte';
 import Button from '../../../core/components/button.svelte';
 import Input from '../../../core/components/input.svelte';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 import { isMobile } from '../../../core/core.js';
 import Spinner from '../../../core/components/spinner.svelte';

 const MessageBar = getContext('MessageBar');
 const menu = getContext('ContextMenu');

 const server = localStorageSharedStore('gif-server-url', 'http://localhost:8888/api');
 let gifs = [];
 let query = '';
 let loading = false;
 let elSearchText;
 let next_url;
 let error;
 let query_done;

 onMount(() => {
  if (!get(isMobile)) {
   elSearchText.focus();
  }
 });

 async function getGifs() {
  if (!query) return;
  loading = true;
  try {
   error = null;
   const server_val = get(server);
   const url = `${server_val}/search?q=${encodeURIComponent(query)}&limit=12`;
   console.log('Loading GIFs from server:', url);
   const response = await fetch(url);
   console.log(response);
   if (!response.ok) {
    error = `HTTP Error: ${response.status}`;
   } else {
    query_done = true;
    const data = (await response.json()).data;
    gifs = data?.results;
    if (data?.next) next_url = url + '&pos=' + data.next;
   }
  } catch (err) {
   console.error('Error while loading GIFs from server:', err);
   error = 'Error while loading GIFs from server.';
  } finally {
   loading = false;
   console.log('GIFs:', gifs);
  }
 }

 function keyGetGifs(e) {
  if (e.key === 'Enter') getGifs();
 }

 function sendGIF(item) {
  const url = item.media_formats.gif?.url;
  MessageBar.sendMessageHtml('<Gif file="' + htmlEscape(url) + '" alt="GIF (animated picture)" ></Gif>');
  menu?.close();
 }
</script>

<style>
 .gifset {
  display: flex;
  flex-direction: column;
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
   <Input placeholder="Search GIFs" grow={true} bind:this={elSearchText} bind:value={query} onKeydown={keyGetGifs} />
   <Button text="Search" width="80px" onClick={getGifs} />
  </div>
 </div>
 {#if error}
  <div>{error}</div>
 {:else}
  <div class="results">
   {#if loading}
    <Spinner />
   {:else if gifs.length === 0 && query_done}
    <div>No GIFs found.</div>
   {:else}
    {#each gifs as item}
     <BaseButton onClick={() => sendGIF(item)}>
      <div class="item">
       <img src={item.media_formats.gif?.url} alt="GIF" />
      </div>
     </BaseButton>
    {/each}
   {/if}
  </div>
 {/if}
</div>
