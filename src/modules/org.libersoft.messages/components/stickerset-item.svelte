<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 import Sticker from './sticker.svelte';
 import { getContext } from 'svelte';
 import { htmlEscape } from '../messages.js';
 export let sticker;
 export let stickerset;
 export let size;
 const MessagesContext = getContext('MessagesContext');
 const popup = getContext('Popup');
 let file;

 $: file = sticker.url;

 async function handleClick() {
  console.log('stickerset-item handleClick file:', file, 'sticker:', sticker);
  await MessagesContext.messageBar.doSendMessage('<Sticker file="' + htmlEscape(file) + '" set="' + htmlEscape(stickerset.url) + '" />', true);
  popup.close();
 }

 function onMousedown(event) {
  console.log('sticker-set-item mousedown');
  event.preventDefault();
  event.stopPropagation();
 }
</script>

<style>
 .sticker {
  display: inline-block;
  padding: 5px;
  border-radius: 10px;
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
 <BaseButton onClick={handleClick} {onMousedown}>
  <div class="sticker" style="max-width: {size}px;">
   <Sticker {size} {file} play_on_start={false} />
  </div>
 </BaseButton>
{/if}
