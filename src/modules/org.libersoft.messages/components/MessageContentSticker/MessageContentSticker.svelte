<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Sticker from '../Stickers/Sticker.svelte';
	import { getContext } from 'svelte';
	const stickerset = $derived(node.attributes.set?.value);
	let { node } = $props();
	let v = node.attributes.file?.value;
	let openStickersetDetailsModal = getContext('openStickersetDetailsModal');
	//$: console.log('MessageContentSticker node:', v);

	function handleClick() {
		if (stickerset) openStickersetDetailsModal(stickerset);
	}
</script>

{#if v}
	<Clickable onClick={handleClick}>
		<Sticker file={v} force_animate intersecting />
	</Clickable>
{/if}
