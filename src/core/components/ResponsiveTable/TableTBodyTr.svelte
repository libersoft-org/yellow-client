<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
 };

 const { children }: Props = $props();
</script>

<style>
 tr {
  /* @media only screen and (min-width: 48m) {
			display: table-row;
			border-style: none;
			border-bottom-width: 0;
		} */
 }
</style>

<tr>
 {@render children()}
</tr>
