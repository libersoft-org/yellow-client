<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
 };

 const { children }: Props = $props();
</script>

<style>
 tr {
  @media only screen and (min-width: 64em) {
   display: table-row;
   border-style: none;
   border-bottom-width: 0;
  }

  &:hover {
   background: #fd1;
  }
 }
</style>

<tr>
 {@render children()}
</tr>
