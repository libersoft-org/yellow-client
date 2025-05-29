<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
  };

  const { children }: Props = $props();
</script>

<thead>
  {@render children()}
</thead>

<style>
  thead {
    display: none;
    background: #222;
    color: white;

    :global(.table-wide &) {
      display: table-header-group;
    }
  }
</style>
