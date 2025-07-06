<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		breakpoint?: string | null;

		[key: string]: unknown;
	}

	const { breakpoint = null, children, ...restProps }: Props = $props();

	let isWide = $state(false);

	$effect(() => {
		if (!breakpoint) return;
		const mql = matchMedia(`(min-width: ${breakpoint})`);
		isWide = mql.matches;
		mql.addEventListener('change', e => (isWide = e.matches));
	});
</script>

<style>
	.table {
		display: flex;
		justify-content: center;
		width: 100%;
		overflow: hidden;
		max-width: 100vw;
		box-sizing: border-box;
	}

	.table.table-wide {
		border: 1px solid var(--secondary-background) !important;
		border-radius: 8px;
	}

	table {
		border: 0;
		padding-bottom: 0;
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: clamp(14px, 2vw, 16px);
	}

	:global(.table-wide) table {
		width: 100%;
	}
</style>

<div class="table" class:table-wide={isWide} {...restProps}>
	<table>
		{@render children?.()}
	</table>
</div>
