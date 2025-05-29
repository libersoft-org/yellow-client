<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
 };

 const { children }: Props = $props();
</script>

<style>
 tbody {
  :global(&:has(> tr:nth-child(2))) {
   :global(tr:nth-child(odd)) {
    background-color: #ffdd1130;
   }

   :global(tr:nth-child(even)) {
    background-color: #ffdd1160;
   }
  }

  :global(.table-wide &) {
   display: table-row-group;
   border-style: none;
   border-bottom-width: 0;
  }
 }
</style>

<tbody>
 {@render children()}
</tbody>
