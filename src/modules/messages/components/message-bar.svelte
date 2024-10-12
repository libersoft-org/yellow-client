<script>
 import { sendMessage } from '../messages.js';
 import { tick } from 'svelte';

 let elMessage;

 /* exported setBarFocus */
 export async function setBarFocus() {
  console.log('elMessage:', elMessage);
  await tick();
  if (elMessage) {
   console.log('elMessage.focus()');
   elMessage.focus();
  }
 }

 function resizeMessage(event) {
  const maxHeight = 200;
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight < maxHeight ? textarea.scrollHeight : maxHeight) + 'px';
  if (elMessage.scrollHeight > maxHeight) elMessage.style.overflowY = 'scroll';
  else elMessage.style.overflowY = 'hidden';
 }

 function clickSend() {
  if (elMessage.value) {
   sendMessage(elMessage.value);
   elMessage.value = '';
  }
  elMessage.focus();
 }

 function keySend(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickSend();
  }
 }

 function keyEnter(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
   event.preventDefault();
   clickSend();
   resizeMessage(event);
  }
 }
</script>

<style>
 .message-bar {
  display: flex;
  align-items: end;
  gap: 10px;
  padding: 10px;
  background-color: #222;
  box-shadow: var(--shadow);
 }

 .message {
  flex-grow: 1;
  padding: 5px;
  border: 0;
  border-bottom: 2px solid #ddd;
  outline: none;
  font-family: inherit;
  font-size: 16px;
  background-color: transparent;
  color: #fff;
  resize: none;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
 }

 .icon {
  cursor: pointer;
 }

 .icon img {
  width: 32px;
  height: 32px;
 }
</style>

<div class="message-bar">
 <textarea class="message" bind:this={elMessage} rows="1" placeholder="Enter your message ..." on:input={resizeMessage} on:keydown={keyEnter}></textarea>
 <div class="icon" role="button" tabindex="0" on:click={clickSend} on:keydown={keySend}><img src="img/send.svg" alt="Send" /></div>
</div>
