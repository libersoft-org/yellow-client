<script lang="ts">
	let { children, node: _node } = $props();
	// @ts-expect-error TS6133 - used in template bind:this
	let _ref: HTMLDivElement | undefined = $state();
</script>

<style>
	.videos-wrap {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.videos {
		--video-size: calc(60 * var(--messages-list-width) / 100);
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="videos-wrap" bind:this={_ref}>
	<div class="videos">
		{#each children as child (child.tagUniqueId)}
			{#if child.component}
				<child.component {...child.props} />
			{/if}
		{/each}
	</div>
</div>
