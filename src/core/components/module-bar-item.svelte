<script>
 import { createEventDispatcher } from 'svelte';
 export let img = '';
 export let alt = '';
 const dispatch = createEventDispatcher();

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   dispatch('click');
  }
 }
</script>

<style>
 .item {
  display: flex;
  padding: 10px;
  cursor: pointer;
 }

 .item img {
  width: 30px;
  height: 30px;
 }
</style>

<div class="item" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
 <img src="img/modules/{img}" {alt} />
</div>
