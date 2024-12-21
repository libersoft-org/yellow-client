<script>
 import Sticker from './sticker.svelte';
 import { getContext } from 'svelte';
 export let sticker;
 export let size;
 export let onClick;
 const MessageBar = getContext('MessageBar');
 const menu = getContext('ContextMenu');

 let file;
 $: file = sticker.url;

 function handleClick() {
  console.log('handleClick');
  onClick && onClick();
  MessageBar.sendMessage('<Sticker file="' + htmlEscape(file) + '" set="' + htmlEscape(sticker.stickerset) + '" />');
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
  border: 1px solid #aaa;
  transition:
   transform 0.3s ease,
   box-shadow 0.3s ease;
 }

 .sticker:hover {
  z-index: 90;
  transform: scale(1.2);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
 }
</style>

{#if file}
 <div class="sticker" role="button" tabindex="0" on:mousedown={mousedown} on:click={handleClick} on:keydown={handleKeydown}>
  <Sticker {size} {file} play_on_start={false} />
 </div>
{/if}
