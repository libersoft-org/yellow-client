<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
 };

 const { children }: Props = $props();
</script>

<style>
 tr {
  :global(&:has(> td:nth-child(2))) {
   /* :global(td:nth-child(odd)) {
				background-color: var(--color-tertiary-background);
			}

			:global(td:nth-child(even)) {
				background-color: var(--color-muted-background)d1160;
			} */
  }

  :global(.table-wide &) {
   display: table-row;
   border-style: none;
   border-bottom-width: 0;
  }
 }
</style>

<tr>
 {@render children()}
</tr>
