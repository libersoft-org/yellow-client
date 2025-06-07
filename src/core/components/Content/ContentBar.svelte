<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		left?: Snippet;
		center?: Snippet;
		right?: Snippet;
	}
	let { children, left, center, right }: Props = $props();
</script>

<style>
	.content-bar {
		display: flex;
		flex-direction: row;
		position: sticky;
		top: 0;
		align-items: center;
		gap: 24px;
		min-height: var(--menu-height);
		max-height: var(--menu-height);
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
		box-shadow: var(--shadow);
		box-sizing: border-box;
		padding: 10px;

		.left,
		.center,
		.right {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 10px;
			flex: 1;
			width: 100%;
		}

		.center {
			justify-content: center;
		}

		.right {
			justify-content: end;
		}
	}
</style>

<div class="content-bar">
	{@render children?.()}
	<div class="left">
		{@render left?.()}
	</div>
	<div class="center">
		{@render center?.()}
	</div>
	<div class="right">
		{@render right?.()}
	</div>
</div>
