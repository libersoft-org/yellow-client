<script lang="ts">
	//import { debug } from '@/core/scripts/stores.ts';
	import StickerSetItem from './StickerSetItem.svelte';
	interface Props {
		items: any[];
		stickerset: any;
		intersecting?: boolean;
	}
	let { items, stickerset, intersecting }: Props = $props();
	let size = 67;
</script>

{#if items}
	{#each items as s, index (s.id)}
		<!--{#if $debug}<code>{JSON.stringify(s)}</code>{/if}-->
		<StickerSetItem {size} sticker={s} {stickerset} {intersecting} />
	{/each}
{/if}
