<script>
 import { createEventDispatcher } from 'svelte';
 export let img = null;
 export let label = '';
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
  height: 30px;
  padding: 10px;
  background-color: #fffcf0;
  border-bottom: 1px solid #dd9;
  cursor: pointer;
 }

 .item .image {
  width: 20px;
  height: 20px;
 }
</style>

<div class="item" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
 {#if img}
  <div class="image"><img src="modules/org.libersoft.dating/img/{img}" alt={label} /></div>
 {/if}
 <div>{label}</div>
</div>
