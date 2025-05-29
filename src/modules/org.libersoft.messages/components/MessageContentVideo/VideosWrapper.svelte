<script>
  import { writable } from 'svelte/store';

  let { children, node } = $props();
  let ref = writable();
</script>

<div class="videos-wrap" bind:this={ref}>
  <div class="videos">
    {#each children as child (child.tagUniqueId)}
      {#if child.component}
        <child.component {...child.props} />
      {/if}
    {/each}
  </div>
</div>

<style>
  .videos-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .videos {
    --video-size: calc(60 * var(--messages-list-width) / 100);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
