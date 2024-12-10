<script>
 import { createEventDispatcher, getContext } from 'svelte';

 export let img = null;
 export let label = '';

 const dispatch = createEventDispatcher();
 let menu = getContext('ContextMenu');

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   trigger();
  }
 }

 function click() {
  trigger();
 }

 function trigger() {
  console.log('trigger');
  dispatch('click');
  menu.close();
 }

 function mousedown(event) {
  console.log('context-menu-item mousedown');
  event.preventDefault();
  event.stopPropagation();
 }
</script>

<style>
 .menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
 }

 .menu-item:hover {
  background-color: #f0f0f0;
 }

 .img-space {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
 }

 .label {
  flex-grow: 1;
 }
</style>

<div class="menu-item" role="button" tabindex="0" on:mousedown={mousedown} on:click={click} on:keydown={handleKeydown}>
 {#if img}
  <div class="img-space">
   <img src={img} alt={label} width="24" height="24" />
  </div>
 {/if}
 <div class="label">{label}</div>
</div>
