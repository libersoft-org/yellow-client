<script>
 import { createEventDispatcher } from 'svelte';
 export let img;
 export let title;
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
  padding: 5px;
  width: 20px;
  height: 20px;
  cursor: pointer;
 }

 .item img {
  width: 20px;
  height: 20px;
 }
</style>

<div class="item" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
 <img src={img} alt={title} />
</div>
