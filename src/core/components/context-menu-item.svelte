<script>
 import { createEventDispatcher } from 'svelte';
 export let icon = null;
 export let label = '';
 const dispatch = createEventDispatcher();

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   dispatch('click');
  }
 }

 function click() {
  console.log('context-menu-item click');
  dispatch('click');
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

 .icon-space {
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
 {#if icon}
  <div class="icon-space">
   <img src={icon} alt="" width="24" height="24" />
  </div>
 {/if}
 <div class="label">{label}</div>
</div>
