<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
	}
	const { children }: Props = $props();
</script>

<style>
	:global(.table-wide) tbody {
		display: table-row-group;
		border-style: none;
		border-bottom-width: 0;
	}
</style>

<tbody>
	{@render children?.()}
</tbody>
