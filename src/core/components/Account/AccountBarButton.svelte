<script lang="ts">
	import type { Snippet } from 'svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	interface Props {
		children?: Snippet;
		[key: string]: any;
	}

	let { children, ...restProps }: Props = $props();
</script>

<style>
	.accounts-button {
		display: flex;
		padding: 10px;
		transition: background-color 0.4s linear;
	}

	.accounts-button:hover,
	:global(.clickable:focus-visible) .accounts-button,
	:global(.clickable.focused) .accounts-button {
		background-color: var(--secondary-softer-background);
	}
</style>

<Clickable {...restProps}>
	<div class="accounts-button">
		{@render children?.()}
	</div>
</Clickable>
