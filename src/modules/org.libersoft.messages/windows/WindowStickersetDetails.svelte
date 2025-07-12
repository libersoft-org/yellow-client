<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { onMount } from 'svelte';
	import { fetchStickerset } from '@/org.libersoft.messages/scripts/stickers.js';
	import StickerSet from '@/org.libersoft.messages/components/Stickers/StickerSet.svelte';
	interface Props {
		params: any;
	}
	let { params }: Props = $props();
	let stickerSetData = $state();
	let stickerServer = $state();
	let id = $state();

	onMount(async () => {
		const parsedUrl = new URL(params.stickersetDetailsWindowStickerset);
		stickerServer = `${parsedUrl.protocol}//${parsedUrl.host}`;
		id = parsedUrl.searchParams.get('id');
		if (id && stickerServer) {
			stickerSetData = await fetchStickerset(stickerServer, parseInt(id as string));
		} else {
			console.warn('Missing id or stickerServer for stickerset fetch');
		}
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
