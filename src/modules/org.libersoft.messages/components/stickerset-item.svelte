<script>
 import Sticker from './sticker.svelte';
 import { createEventDispatcher, getContext } from 'svelte';
 export let file;
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
 .link {
  cursor: pointer;
 }
</style>

{#if file}
 <div class="link" role="button" tabindex="0" on:mousedown={mousedown} on:click={click} on:keydown={handleKeydown}>
  <Sticker {file} size="80" />
 </div>
{/if}
