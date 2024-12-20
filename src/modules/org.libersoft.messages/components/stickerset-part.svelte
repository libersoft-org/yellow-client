<script>
 import Item from './stickerset-item.svelte';
 //import { Grid } from 'svelte-virtual';
 export let items;
 let size = 68;
</script>

{#each items as s, index}
 <Item {size} sticker={s} />
{/each}
