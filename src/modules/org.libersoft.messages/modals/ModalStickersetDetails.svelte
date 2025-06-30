<script lang="ts">
	import { debug } from '@/core/stores.ts';
	import { onMount } from 'svelte';
	import { fetchStickerset } from '../stickers.js';
	import StickerSet from '../components/Stickers/StickerSet.svelte';
	interface Props {
		params: any;
	}
	let { params }: Props = $props();
	let stickerSetData = $state();
	let stickerServer = $state();
	let id = $state();

	onMount(async () => {
		const parsedUrl = new URL(params.stickersetDetailsModalStickerset);
		stickerServer = `${parsedUrl.protocol}//${parsedUrl.host}`;
		id = parsedUrl.searchParams.get('id');
		stickerSetData = await fetchStickerset(stickerServer as string, id ? parseInt(id, 10) : undefined);
	});
</script>

<div>
	{#if $debug}
		stickerServer: {stickerServer}
		id: {id}
	{/if}
	{#if stickerSetData}
		<StickerSet stickerset={stickerSetData} showall={true} />
	{/if}
</div>
