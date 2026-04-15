<script lang="ts">
	import StickersView from './StickersView.svelte';
	import { stickerset_favorites } from '@/org.libersoft.messages/scripts/stickers.ts';
	let view;

	export function onShow(): void {
		view.onShow();
	}
</script>

<StickersView bind:this={view} stickerset_favorites={$stickerset_favorites} />
