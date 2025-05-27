<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
  maxWidth?: string;
 };

 const { children, padding = '10px', background = '#fff', border = '1px solid #000', radius = '10px', maxWidth = '768px' }: Props = $props();
</script>

<style>
 .paper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow);
  width: 100%;
  box-sizing: border-box;

  /* @container (max-width: 768px) {
			background-color: red !important;
		} */
 }
</style>

<div class="paper" style={`padding: ${padding}; background: ${background}; border: ${border}; border-radius: ${radius}; max-width: ${maxWidth};`}>
 {@render children()}
</div>
