<script>
	import { debug } from '@/core/stores.ts';
	import { onMount } from 'svelte';
	import { fetchStickerset } from '../stickers.js';
	import StickerSet from '../components/Stickers/StickerSet.svelte';
	export let params;
	let stickerSetData;
	let stickerServer;
	let id;

	onMount(async () => {
		const parsedUrl = new URL(params.stickersetDetailsModalStickerset);
		stickerServer = `${parsedUrl.protocol}//${parsedUrl.host}`;
		id = parsedUrl.searchParams.get('id');
		stickerSetData = await fetchStickerset(stickerServer, id);
	});
</script>

<div>
	{#if $debug}
		stickerServer: {stickerServer}
		id: {id}
	{/if}
	{#if stickerSetData}
		<StickerSet stickerset={stickerSetData} showall="true" />
	{/if}
</div>
