<script>
  //import { debug } from '@/core/core.js';
  import StickerSetItem from './StickerSetItem.svelte';
  export let items;
  export let stickerset;
  export let intersecting;
  let size = 67;
</script>

{#if items}
  {#each items as s, index (s.id)}
    <!--{#if $debug}<code>{JSON.stringify(s)}</code>{/if}-->
    <StickerSetItem {size} sticker={s} {stickerset} {intersecting} />
  {/each}
{/if}
