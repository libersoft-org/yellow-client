<script lang="ts">
	import StickersView from './StickersView.svelte';
	let view;

	export function onShow() {
		view.onShow();
	}
</script>

<StickersView bind:this={view} stickerset_favorites={[]} />
