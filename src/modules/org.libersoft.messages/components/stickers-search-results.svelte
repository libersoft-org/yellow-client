<script>
 import VirtualList from './virtual-list.svelte';
 import StickerSet from './stickerset.svelte';

 let { start = $bindable(), end = $bindable(), items } = $props();
</script>

{#if $items}
 <div class="stickersets">
  <VirtualList items={$items} let:item bind:start bind:end contents_styles={'display: flex; flex-direction: column; gap: 28px;'}>
   <StickerSet stickerset={item} />
  </VirtualList>
  <!--
 {#each $library as item}
  <StickerSet stickerset={item} />
 {/each}
-->
 </div>
{/if}
