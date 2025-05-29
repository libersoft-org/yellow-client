<script>
	import { tick } from 'svelte';
	import Intersector from '../Intersector/Intersector.svelte';
	import StickerSet from './StickerSet.svelte';
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
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0 0 10px 0;
	}
</style>

<div class="results" bind:this={container}>
	<!--
 {#each items as item}
  <StickerSet stickerset={item} />
 {/each}
-->

	<Intersector {items} item_slot={item} />
</div>

{#snippet item(item, intersecting)}
	<StickerSet stickerset={item} {intersecting} />
{/snippet}
