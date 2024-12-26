<script>
 import { onMount } from 'svelte';
 import Button from '../../../core/components/button.svelte';
 import InputText from '../../../core/components/input-text.svelte';
 let searchTerm = '';
 let gifs = [];
 let loading = false;

 async function getGifs() {
  if (!searchTerm) return;
  loading = true;
  try {
   let response = await fetch('https://tenor.googleapis.com/v2/search?q=' + encodeURIComponent(searchTerm) + 'limit=10');
   let data = await response.json();
   gifs = data.results.map(gif => gif.media_formats.gif.url);
  } catch (error) {
   console.error('Error while fetching GIFs:', error);
  } finally {
   loading = false;
  }
 }
</script>

<style>
 .gifset {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
 }

 .controls {
  display: flex;
  gap: 10px;
 }

 .container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
 }

 .container img {
  width: 100px;
  height: 100px;
  object-fit: cover;
 }
</style>

<div class="gifset">
 <div class="controls">
  <InputText placeholder="Search GIFs..." bind:value={searchTerm} on:keydown={e => e.key === 'Enter' && fetchGifs()} />
  <Button text="Search" onClick={getGifs} />
 </div>
 {#if loading}
  <div>Loading...</div>
 {:else if gifs.length === 0 && searchTerm}
  <div>No GIFs found.</div>
 {:else}
  <div class="container">
   {#each gifs as gif}
    <img src={gif} alt="GIF" />
   {/each}
  </div>
 {/if}
</div>
