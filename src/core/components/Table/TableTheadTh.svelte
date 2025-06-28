<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	const { children }: Props = $props();
</script>

<style>
	:global(.table-wide) th {
		display: table-cell;
		white-space: nowrap;
		border-style: none;
		min-width: 50px;
		vertical-align: middle;
		padding: 8px;
		border: 0;
		text-align: left;
		white-space: normal;
	}
</style>

<th scope="col">
	{@render children?.()}
</th>
