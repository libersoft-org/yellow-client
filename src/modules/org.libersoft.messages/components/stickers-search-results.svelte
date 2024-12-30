<script>
 import { onMount, onDestroy } from 'svelte';
 import Intersector from './intersector.svelte';
 import StickerSet from './stickerset.svelte';

 export let items;
 export let cmpIntersector;
</script>

<style>
 .results {
  overflow: auto;
 }
</style>

<div class="results">
 <!--
 {#each items as item}
  <StickerSet stickerset={item} />
 {/each}
-->

 <Intersector bind:this={cmpIntersector} {items} let:item let:intersecting>
  <StickerSet stickerset={item} {intersecting} />
 </Intersector>
</div>
