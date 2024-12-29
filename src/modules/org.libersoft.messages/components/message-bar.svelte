<script>
 import { sendMessage } from '../messages.js';
 import { setContext, tick } from 'svelte';
 import BaseButton from '../../../core/components/base-button.svelte';
 import Icon from '../../../core/components/icon.svelte';
 import ContextMenu from '../../../core/components/context-menu.svelte';
 import ContextMenuItem from '../../../core/components/context-menu-item.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalHTML from '../modals/html.svelte';
 import Expressions from './expressions.svelte';
 let elAttachment;
 let elExpressions;
 let elMessage;
 let text;
 let showHTMLModal = false;
 let expressionsHeight = '500px';
 let showExpressions = false;

 setContext('MessageBar', {
  sendMessage,
  setBarFocus,
 });

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

 function clickRecord(event) {
  console.log('clicked on record mic / camera - long press to record, short press to switch mic / camera');
 }

 function sendFile() {
  console.log('clicked on file');
 }

 function sendHTML() {
  showHTMLModal = true;
 }

 function sendLocation() {
  console.log('clicked on location');
 }
</script>

<style>
 .message-bar {
  position: sticky;
  bottom: 0;
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
  <Icon img="modules/org.libersoft.messages/img/attachment.svg" alt="Attachment" size="32" padding="0" />
 </div>
 <BaseButton onClick={() => (showExpressions = !showExpressions)}>
  <div bind:this={elExpressions}>
   <Icon img="modules/org.libersoft.messages/img/emoji.svg" alt="Emoji" size="32" padding="0" />
  </div>
 </BaseButton>
 <textarea class="message" bind:value={text} bind:this={elMessage} rows="1" placeholder="Enter your message ..." on:input={resizeMessage} on:keydown={keyEnter}></textarea>
 <Icon img="modules/org.libersoft.messages/img/mic.svg" alt="Record voice message" size="32" padding="0" onClick={clickRecord} />
 <Icon img="modules/org.libersoft.messages/img/send.svg" alt="Send" size="32" padding="0" onClick={clickSend} />
</div>

<ContextMenu target={elAttachment}>
 <ContextMenuItem img="modules/org.libersoft.messages/img/file.svg" label="File" onClick={sendFile} />
 <ContextMenuItem img="modules/org.libersoft.messages/img/html.svg" label="HTML" onClick={sendHTML} />
 <ContextMenuItem img="modules/org.libersoft.messages/img/map.svg" label="Location" onClick={sendLocation} />
</ContextMenu>

<ContextMenu target={elExpressions} width="363px" height={expressionsHeight} scrollable={false}>
 <Expressions height={expressionsHeight} />
</ContextMenu>

<!--
<Modal body={Expressions} width="363px" bind:show={showExpressions} />
-->

<!--
<Expressions />
-->

<Modal title="HTML composer" body={ModalHTML} bind:show={showHTMLModal} />
