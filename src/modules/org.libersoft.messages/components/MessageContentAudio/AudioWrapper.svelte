<script lang="ts">
	interface Props {
		children?: any[];
		node?: any;
	}
	let { children, node: _node }: Props = $props();
	// @ts-expect-error TS6133 - used in template bind:this
	let _ref: HTMLDivElement | undefined = $state();
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

<div class="audio-wrap" bind:this={_ref}>
	<div class="audio-list">
		{#each children || [] as child (child.tagUniqueId)}
			{#if child.component}
				<child.component {...child.props} />
			{/if}
		{/each}
	</div>
</div>
