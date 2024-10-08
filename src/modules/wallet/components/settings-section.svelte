<script>
 import { createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 export let label;
 export let active = false;

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   dispatch('click');
  }
 }
</script>

<div class="section {active ? 'active' : ''}" role="button" tabindex="0" on:click on:keydown={handleKeydown}>{label}</div>

<style>
 .section {
  padding: 10px;
  background-color: #ffa;
  cursor: pointer;
 }

 .section.active {
  font-weight: bold;
  background-color: #fe6;
 }

 .section:hover {
  background-color: #fd1;
 }
</style>
