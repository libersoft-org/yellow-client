<script>
 import { createEventDispatcher } from 'svelte';
 export let item = '';
 export let icon = '';
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
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
 }

 .item img {
  width: 32px;
  height: 32px;
 }

 .item.even {
  background-color: #ffa;
 }

 .item.odd {
  background-color: #ffd;
 }

 .item:hover {
  background-color: #fd1;
 }
</style>

<div class="item {className}" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
 {#if icon}
  <div><img src={icon} alt="{item}" /></div>
 {/if}
 <div>{item}</div>
</div>
