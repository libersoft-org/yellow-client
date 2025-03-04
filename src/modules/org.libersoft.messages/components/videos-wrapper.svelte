<script>
 import { writable } from 'svelte/store';

 let { children, node } = $props();
 let ref = writable();
</script>

<style>
 .videos-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .videos {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }
</style>

<div class="videos-wrap" bind:this={ref}>
 hello
 <div class="videos">
  {#each children as child (child.tagUniqueId)}
   {#if child.component}
    <svelte:component this={child.component} {...child.props} />
   {/if}
  {/each}
 </div>
</div>
