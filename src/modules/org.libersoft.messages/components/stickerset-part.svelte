<script>
 import Item from './stickerset-item.svelte';
 //import { Grid } from 'svelte-virtual';
 export let items;
 export let stickerset;
 let size = 67;
</script>

{#each items as s, index (s.id)}
 <Item {size} sticker={s} {stickerset} />
{/each}
