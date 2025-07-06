<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		align?: 'left' | 'center' | 'right';
	}
	const { children, align = 'left' }: Props = $props();
</script>

<style>
	:global(.expand) th {
		display: table-cell;
		white-space: nowrap;
		border-style: none;
		min-width: 50px;
		vertical-align: middle;
		padding: 10px;
		text-align: left;
		white-space: normal;
	}
</style>

<th scope="col" style:text-align={align}>
	{@render children?.()}
</th>
