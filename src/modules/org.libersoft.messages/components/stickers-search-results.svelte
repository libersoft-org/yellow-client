<script>
 import VirtualList from './virtual-list.svelte';
 import StickerSet from './stickerset.svelte';

 let { start = $bindable(), end = $bindable(), items } = $props();

 $effect(() => {
  console.log('stickers-search-results items:', items);
 });
</script>

<VirtualList {items} let:item bind:start bind:end contents_styles={'display: flex; flex-direction: column; gap: 28px;'}>
 <StickerSet stickerset={item} />
</VirtualList>

<!--
{#each items as item}
 <StickerSet stickerset={item} />
{/each}
-->
