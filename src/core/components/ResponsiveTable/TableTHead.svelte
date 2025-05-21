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
  background: #222;
  color: white;

  /* @media only screen and (min-width: 48em) {
			display: table-header-group;
		} */
 }
</style>

<thead>
 {@render children()}
</thead>
