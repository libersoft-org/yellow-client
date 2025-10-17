<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Sticker from '../Stickers/Sticker.svelte';
	import { getContext } from 'svelte';
	let { node } = $props();
	const stickerset = $derived(node.attributes.set?.value);
	let v = node.attributes.file?.value;
	let openStickersetDetailsWindow: any = getContext('openStickersetDetailsWindow');
	//$: console.log('MessageContentSticker node:', v);

	function handleClick() {
		if (stickerset) openStickersetDetailsWindow(stickerset);
	}
</script>

{#if v}
	<Clickable onClick={handleClick}>
		<Sticker file={v} force_animate intersecting />
	</Clickable>
{/if}
