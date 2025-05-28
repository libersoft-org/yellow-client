<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
 };

 const { children }: Props = $props();
</script>

<style>
 .action-items {
  display: inline-flex;
  gap: 12px;
 }
</style>

<div class="action-items">
 {@render children()}
</div>
