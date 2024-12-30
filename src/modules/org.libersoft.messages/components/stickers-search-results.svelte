<script>
 import { onMount, onDestroy } from 'svelte';
 import VirtualList from './virtual-list.svelte';
 import StickerSet from './stickerset.svelte';

 export let items;

 let container;
 let scrollTop = 0;
 let containerHeight = 0;

 let itemHeight = 30;

 let frame;

 function poll() {
  if (container.scrollTop !== scrollTop) {
   scrollTop = container.scrollTop;
  }

  frame = requestAnimationFrame(poll);
 }

 onMount(() => {
  frame = requestAnimationFrame(poll);
 });

 onDestroy(() => {
  cancelAnimationFrame(poll);
 });
</script>

<style>
 .books {
  overflow: auto;

  /* This is just for the demo, your scrolling container can have any size  */
  border: 1px solid #000;
  width: 500px;
  height: 500px;
 }

 .book {
  /* You can also use inline-grid and define grid-template-* on the parent for easy virtual grid */
  display: inline-block;
  white-space: nowrap;

  /* One inline-block per line, no horizontal scrolling  */
  box-sizing: border-box;
  padding: 0 0.5rem;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  /* We re-use items when they leave the viewport by adjusting their "top" value */
  /* Depending on your use case you might achieve better results using translate3d + will-change */
  position: relative;
 }

 .dummy {
  /* The dummy is just an invisible empty item */
  /* But if you want that look you can actually render it like an empty cell */
  border-color: transparent;
 }
</style>

<h1>{items.length}</h1>

<div class="books" bind:this={container} bind:clientHeight={containerHeight}>
 <VirtualList {items} {itemHeight} {containerHeight} {scrollTop} let:item let:dummy let:y>
  <div class="book" class:dummy style="top:{y}px;">
   <StickerSet stickerset={item} />
  </div>
 </VirtualList>
</div>
