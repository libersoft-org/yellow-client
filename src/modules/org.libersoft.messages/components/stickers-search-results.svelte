<script>
 import { onMount, onDestroy, tick } from 'svelte';
 import Intersector from './intersector.svelte';
 import StickerSet from './stickerset.svelte';

 export let items;
 let container;

 export async function scroll_to_top() {
  //window.scrollTo(0, 0);
  await tick();
  console.log('scroll_to_top, container:', container, 'container.scrollTop:', container?.scrollTop);
  await container?.scrollTo(0, 0);
 }
</script>

<style>
 .results {
  overflow: auto;
 }
</style>

<div class="results" bind:this={container}>
 <!--
 {#each items as item}
  <StickerSet stickerset={item} />
 {/each}
-->

 <Intersector {items} let:item let:intersecting>
  <StickerSet stickerset={item} {intersecting} />
 </Intersector>
</div>
