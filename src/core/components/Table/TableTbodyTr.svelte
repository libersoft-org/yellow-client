<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
 };

 const { children }: Props = $props();
</script>

<style>
 tr:nth-child(even) {
  background-color: var(--color-primary-soft-background);
 }

 tr:nth-child(odd) {
  background-color: var(--color-primary-softer-background);
 }

 tr:hover {
  background-color: var(--color-primary-background);
 }

 .tr {
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
