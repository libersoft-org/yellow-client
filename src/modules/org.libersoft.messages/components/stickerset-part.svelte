<script>
 import { debug } from '../../../core/core.js';
 import Item from './stickerset-item.svelte';
 export let items;
 export let stickerset;
 let size = 67;
</script>

{#if items}
 {#each items as s, index (s.id)}
  {#if $debug}<code>{JSON.stringify(s)}</code>{/if}
  <Item {size} sticker={s} {stickerset} />
 {/each}
{/if}
