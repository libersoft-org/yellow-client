<script>
	import { writable } from 'svelte/store';

	let { children, node } = $props();
	let ref = writable();
</script>

<style>
	.audio-wrap {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.audio-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="audio-wrap" bind:this={ref}>
	<div class="audio-list">
		{#each children as child (child.tagUniqueId)}
			{#if child.component}
				<child.component {...child.props} />
			{/if}
		{/each}
	</div>
</div>
