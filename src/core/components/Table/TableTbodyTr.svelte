<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
  background?: string;
  hover?: boolean;
  stripe?: boolean; // enable striped rows manually
 };

 const { children, background, hover = true, stripe = false }: Props = $props();
</script>

<style>
 /* Default odd/even styles if `striped` class is present */
 tr.striped:nth-child(even) {
  background-color: var(--color-primary-soft-background);
 }

 tr.striped:nth-child(odd) {
  background-color: var(--color-primary-softer-background);
 }

 tr.hover:hover {
  background-color: var(--color-primary-background) !important;
 }
</style>

<tr class:hover class:striped={stripe} style={background && `background-color: ${background}`}>
 {@render children()}
</tr>
