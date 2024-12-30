<script>
 import { onMount, onDestroy } from 'svelte';
 import StickerSet from './stickerset.svelte';

 export let items;
</script>

{#each items as item}
 <StickerSet stickerset={item} />
{/each}
