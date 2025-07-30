<script lang="ts">
	import StickersView from './StickersView.svelte';
	import { stickerset_favorites } from '@/org.libersoft.messages/scripts/stickers.js';
	let view;

	export function onShow() {
		view.onShow();
	}
</script>

<StickersView bind:this={view} stickerset_favorites={$stickerset_favorites} />
