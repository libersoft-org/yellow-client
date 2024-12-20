<script>
 import Sticker from './sticker.svelte';
 import { getContext } from 'svelte';
 export let file;
 export let size;
 export let onClick;
 const MessageBar = getContext('MessageBar');
 const menu = getContext('ContextMenu');

 function handleClick() {
  console.log('handleClick');
  onClick && onClick();
  MessageBar.sendMessage('<Sticker file="' + htmlEscape(file) + '" />');
  MessageBar.setBarFocus();
  menu.close();
 }

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   handleClick();
  }
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
  /* Basic styling */
  border: 1px solid #aaa;
  display: inline-block;
  transition:
   transform 0.3s ease,
   box-shadow 0.3s ease;
  /* transition for smooth scaling and shadow changes */
 }

 .sticker:hover {
  z-index: 90;
  transform: scale(1.2); /* Slight enlargement (5% bigger) */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45); /* Add a drop shadow for "popping" effect */
 }
</style>

{#if file}
 <div class="sticker" role="button" tabindex="0" on:mousedown={mousedown} on:click={handleClick} on:keydown={handleKeydown}>
  <Sticker {size} {file} play_on_start={false} />
 </div>
{/if}
