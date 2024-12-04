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
 .icon {
  cursor: pointer;
 }

 .icon img {
  width: 32px;
  height: 32px;
 }
</style>

<div class="icon" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
 <img src={img} {alt} />
</div>
