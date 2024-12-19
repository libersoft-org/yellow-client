<script>
 import Item from './stickerset-item.svelte';
 import { Grid } from 'svelte-virtual';

 export let items;

 let size = 80;
</script>

<!--

https://github.com/ghostebony/svelte-virtual/blob/main/src/lib/grid/Grid.svelte

<Grid itemCount={items.length} itemHeight={size} itemWidth={size}>
	{#snippet item({ index, style })}
		<div {style}>
			<Item {size} file={items[index].url} autoplay={false} />
		</div>
	{/snippet}
</Grid>
-->

{#each items as s, index}
 {index}
 <Item {size} file={s.url} autoplay={index < 73} />
{/each}
