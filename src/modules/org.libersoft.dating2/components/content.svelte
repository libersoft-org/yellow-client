<script>
 import { onMount } from 'svelte';
 let cont;
 let cont2;

 onMount(() => {
  cont2 = cont.clientHeight;
  console.log(cont2);
 });
</script>

<style>
 .page-content {
  height: calc(100% - 78px);
  max-height: calc(100% - 78px);
  padding: 10px;
  overflow: auto;
  background-color: #fff;
 }
</style>

<div class="page-content" bind:this={cont}>
 <slot></slot>
</div>
