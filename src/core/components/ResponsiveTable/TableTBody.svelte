<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
 };

 const { children }: Props = $props();
</script>

<style>
 tbody {
  @media only screen and (min-width: 80em) {
   display: table-row-group;
   border-style: none;
   border-bottom-width: 0;
  }
 }
</style>

<tbody>
 {@render children()}
</tbody>
