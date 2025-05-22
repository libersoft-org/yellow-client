<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
 };

 const { children }: Props = $props();
</script>

<th scope="col">
 {@render children()}
</th>

<!-- <style>
	th {
		@media only screen and (min-width: 48em) {
			display: table-cell;
			white-space: nowrap;
			border-style: none;
			font-weight: 500;
			min-width: 50px;
			vertical-align: middle;
			padding: 8px;
			border: 0;
			text-align: left;
			white-space: normal;
		}
	}
</style> -->
