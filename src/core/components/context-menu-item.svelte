<script>
 import { getContext } from 'svelte';
 import BaseButton from './base-button.svelte';
 export let img = null;
 export let label = '';
 export let onClick;
 let menu = getContext('ContextMenu');

 function handleClick() {
  console.log('handleClick');
  onClick();
  menu.close();
 }

 function handleMousedown(event) {
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

<BaseButton onClick={handleClick} onMousedown={handleMousedown}>
 <div class="menu-item">
  {#if img}
   <div class="img-space">
    <img src={img} alt={label} width="24" height="24" />
   </div>
  {/if}
  <div class="label">{label}</div>
 </div>
</BaseButton>
