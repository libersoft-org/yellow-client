<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		even?: boolean;
		active?: boolean;
		onClick?: (e: Event) => void;
		[key: string]: any;
	}
	let { children, even = false, active = false, onClick, ...restProps }: Props = $props();

	function handleClick(e) {
		console.log('SidebarItem clicked');
		if (onClick) onClick(e);
	}
</script>

<style>
	.sidebar-item {
		display: flex;
		flex-direction: column;
		padding: 10px;
		border-bottom: 1px solid var(--primary-background);
		color: var(--primary-foreground);
		cursor: pointer;
		transition: background-color 0.4s linear;
		min-width: 0;
	}

	.sidebar-item.even {
		background-color: var(--primary-soft-background);
	}

	.sidebar-item.odd {
		background-color: var(--primary-softer-background);
	}

	.sidebar-item:hover {
		background-color: var(--primary-background);
	}

	.sidebar-item.active {
		background-color: var(--primary-hard-background);
		transition: background-color 0.4s linear;
	}
</style>

<Clickable {...restProps} onClick={handleClick}>
	<div class="sidebar-item {even ? 'even' : 'odd'} {active && 'active'}">
		{@render children?.()}
	</div>
</Clickable>
