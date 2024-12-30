<script>
 import { onMount, onDestroy } from 'svelte';
 import StickerSet from './stickerset.svelte';

 export let items;
</script>

<style>
 .results {
  overflow: auto;
 }
</style>

<div class="results">
 {#each items as item}
  <StickerSet stickerset={item} />
 {/each}
</div>
