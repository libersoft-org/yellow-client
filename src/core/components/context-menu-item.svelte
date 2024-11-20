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

<div class="menu-item" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
 <div class="icon-space">
  {#if icon}
   <img src={icon} alt="" width="24" height="24" />
  {/if}
 </div>
 <div class="label">{label}</div>
</div>
