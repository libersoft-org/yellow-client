<script lang="ts">
	import type { Snippet } from 'svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	interface Props {
		children?: Snippet;
		onClick?: (e: Event) => void;
		[key: string]: any;
	}

	let { children, ...restProps }: Props = $props();
</script>

<style>
	.accounts-button {
		display: flex;
		flex: 1;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		padding: 10px;
		transition: background-color 0.4s linear;
	}

	.accounts-button:hover {
		background-color: var(--secondary-softer-background);
	}
</style>

<Clickable {...restProps}>
	<div class="accounts-button">
		{@render children?.()}
	</div>
</Clickable>
