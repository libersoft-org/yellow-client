<script>
 import { sendMessage } from '../messages.js';
 import { tick } from 'svelte';
 import Icon from './message-bar-icon.svelte';
 import ContextMenu from '../../../core/components/context-menu.svelte';
 import ContextMenuItem from '../../../core/components/context-menu-item.svelte';
 let elAttachment;
 let elMessage;
 let text;

 $: console.log('message-bar text:', text);

 export async function setBarFocus() {
  await tick();
  console.log('setBarFocus');
  if (elMessage) {
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

 export function dispatchEvent(event) {
  text = event.key;
 }

 function clickSend(event) {
  if (elMessage.value) {
   sendMessage(elMessage.value);
   elMessage.value = '';
  }
  resizeMessage(event);
  elMessage.focus();
 }

 function keyEnter(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
   event.preventDefault();
   clickSend(event);
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
</style>

<div class="message-bar">
 <div bind:this={elAttachment}>
  <Icon img="attachment.svg" alt="Attachment" />
 </div>
 <textarea class="message" bind:value={text} bind:this={elMessage} rows="1" placeholder="Enter your message ..." on:input={resizeMessage} on:keydown={keyEnter}></textarea>
 <Icon img="send.svg" alt="Send" on:click={clickSend} />
</div>

<ContextMenu target={elAttachment}>
 <ContextMenuItem
  img="modules/org.libersoft.messages/img/file.svg"
  label="File"
  on:click={() => {
   console.log('clicked on file');
  }}
 />
</ContextMenu>
