<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();
</script>

<style>
	.tabs {
		display: flex;
		width: 100%;
		border-radius: 10px;
		overflow: hidden;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}
</style>

<div>
	<div class="tabs">
		{#if children}
			{@render children?.()}
		{/if}
	</div>
</div>
