<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		position?: 'top' | 'bottom';
		height?: string;
		left?: Snippet;
		center?: Snippet;
		right?: Snippet;
	}
	let { children, position = 'top', height = 'var(--menu-height)', left, center, right }: Props = $props();
</script>

<style>
	.content-bar {
		position: sticky;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 24px;
		padding: 10px;
		box-sizing: border-box;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
		box-shadow: var(--shadow);
	}

	.content-left,
	.content-center,
	.content-right {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;
		flex: 1;
		width: 100%;
	}

	.content-center {
		justify-content: center;
	}

	.content-right {
		justify-content: end;
	}

	.position-top {
		top: 0;
	}

	.position-bottom {
		bottom: 0;
	}
</style>

<div class="content-bar {position === 'top' ? 'position-top' : ''} {position === 'bottom' ? 'position-bottom' : ''}" style:min-height={height} style:max-height={height}>
	{@render children?.()}
	{#if left}
		<div class="content-left">
			{@render left?.()}
		</div>
	{/if}
	{#if center}
		<div class="content-center">
			{@render center?.()}
		</div>
	{/if}
	{#if right}
		<div class="content-right">
			{@render right?.()}
		</div>
	{/if}
</div>
