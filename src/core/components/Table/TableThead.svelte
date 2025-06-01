<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	const { children }: Props = $props();
</script>

<style>
	thead {
		display: none;

		:global(.table-wide &) {
			display: table-header-group;
		}
	}
</style>

<thead>
	{@render children()}
</thead>
