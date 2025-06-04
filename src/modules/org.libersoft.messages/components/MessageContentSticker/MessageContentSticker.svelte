<script>
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Sticker from '../Stickers/Sticker.svelte';
	import { getContext, onMount } from 'svelte';
	let { node } = $props();
	let v = node.attributes.file?.value;
	const stickerset = $derived(node.attributes.set?.value);
	let openStickersetDetailsModal = getContext('openStickersetDetailsModal');
	//$: console.log('MessageContentSticker node:', v);

	function handleClick() {
		if (stickerset) {
			openStickersetDetailsModal(stickerset);
		}
	}

	onMount(() => {
		//console.log('MessageContentSticker onMount:', v);
	});
</script>

{#if v}
	<Clickable onClick={handleClick}>
		<Sticker file={v} force_animate={true} intersecting={true} />
	</Clickable>
{/if}
