<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		padding?: string;
		background?: string;
		color?: string;
		border?: string;
		radius?: string;
		maxWidth?: string;
	}
	const { children, padding = '10px', background = 'var(--default-background)', color = 'var(--default-foreground)', border = '1px solid var(--default-foreground)', radius = '10px', maxWidth = '768px' }: Props = $props();
</script>

<style>
	.paper {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		box-sizing: border-box;
		box-shadow: var(--shadow);
	}
</style>

<div class="paper" style={`padding: ${padding}; background: ${background}; color: ${color}; border: ${border}; border-radius: ${radius}; max-width: ${maxWidth};`}>
	{@render children?.()}
</div>
