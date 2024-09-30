<script>
 import { createEventDispatcher } from 'svelte';
 export let item = '';
 export let className = '';
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
  padding: 10px;
  cursor: pointer;
 }

 .item.even {
  background-color: #fec;
 }

 .item.odd {
  background-color: #fea;
 }

 .item:hover {
  background-color: #fd1;
 }
</style>

<div class="item {className}" role="button" tabindex="0" on:click on:keydown={handleKeydown}>{item}</div>
