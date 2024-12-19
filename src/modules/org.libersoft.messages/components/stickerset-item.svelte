<script>
 import Sticker from './sticker.svelte';
 import { createEventDispatcher, getContext } from 'svelte';
 export let file;
 export let size;
 const dispatch = createEventDispatcher();
 let menu = getContext('ContextMenu');

 const MessageBar = getContext('MessageBar');

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
  MessageBar.sendMessage('<Sticker file="' + htmlEscape(file) + '" />');
  MessageBar.setBarFocus();
  menu.close();
 }

 function htmlEscape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
 }

 function mousedown(event) {
  console.log('sticker-set-item mousedown');
  event.preventDefault();
  event.stopPropagation();
 }
</script>

<style>
 .sticker {
  cursor: pointer;
  display: inline-block;
  padding: 5px;
  border-radius: 5px;
  background-color: #f0f0f0;
  transition: background-color 0.2s;
 }
</style>

{#if file}
 <div class="sticker" role="button" tabindex="0" on:mousedown={mousedown} on:click={click} on:keydown={handleKeydown}>
  <Sticker {size} {file} />
 </div>
{/if}
