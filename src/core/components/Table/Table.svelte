<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	interface Props {
		children?: Snippet;
		breakpoint?: string | null;
		hideBorder?: boolean;
		[key: string]: unknown;
	}
	const { breakpoint = null, children, hideBorder = false, ...restProps }: Props = $props();
	let isWide = $state(false);

	onMount(() => {
		if (!breakpoint) return;
		const mql = matchMedia(`(min-width: ${breakpoint})`);
		isWide = mql.matches;
		const handler = (e: MediaQueryListEvent): void => {
			isWide = e.matches;
		};
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});
</script>

<style>
	table {
		box-sizing: border-box;
		width: 100%;
		max-width: 100vw;
		overflow: hidden;
		border: 1px solid var(--secondary-background);
		border-radius: 10px;
		border-spacing: 0;
		padding-bottom: 0;
		font-size: clamp(14px, 2vw, 16px);
	}
</style>

<table class:expand={isWide} class:hide-border={hideBorder} {...restProps}>
	{@render children?.()}
</table>
