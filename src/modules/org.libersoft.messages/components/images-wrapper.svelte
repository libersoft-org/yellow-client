<script>
 import { onMount } from 'svelte';

 let { children, node } = $props();
 const childrenLength = node?.childNodes.length || 0;

 onMount(() => {
 });
</script>

<style>
 .images {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  width: 100%;
 }
 .images > :global(.message-content-image-wrapper) {
 }
 .images :global(.message-content-image) {
  display: flex;
  flex: 1 1;
  max-width: 120px;
  min-width: 120px;
  /*width: 100%;*/
  /*height: 100%;*/
 }
 .images :global(.message-content-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
 }
 @container (max-width: 300px) {

 }
</style>

<div class="images-wrap">
 <div class="images" data-children-length="{childrenLength}">
  {@render children?.()}
 </div>
</div>
