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
  height: 100%;
  padding: 10px;
  overflow: auto;
  background-color: red;
 }
</style>

<div class="page-content" bind:this={cont}>
 <slot></slot>
</div>
