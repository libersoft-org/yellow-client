<script>
 import { createEventDispatcher } from 'svelte';
 export let title = '';
 export let icon = '';
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
  align-items: center;
  gap: 10px;
  padding: 5px;
  cursor: pointer;
 }

 .item img {
  width: 20px;
  height: 20px;
 }
</style>

<div class="item" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
 <img src={icon} alt={title} />
</div>
