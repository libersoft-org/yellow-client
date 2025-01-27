<script>
 import { identifier, preprocess_incoming_plaintext_message_text, sendMessage } from '../messages.js';
 import { onMount, setContext, tick } from 'svelte';
 import BaseButton from '../../../core/components/base-button.svelte';
 import Icon from '../../../core/components/icon.svelte';
 import ContextMenu from '../../../core/components/context-menu.svelte';
 import ContextMenuItem from '../../../core/components/context-menu-item.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalHTML from '../modals/html.svelte';
 import Expressions from './expressions.svelte';
 //import {  init_emojis } from '../emojis.js';
 let elAttachment;
 let elExpressions;
 let elMessage;
 let elMessageBar;
 let text;
 let showHTMLModal = false;
 let expressionsHeight = '500px';
 let showExpressions = false;

 onMount(async () => {
  console.log('MessageBar mounted');
 });

 setContext('MessageBar', {
  sendMessageHtml: text => doSendMessage(text, true),
  sendMessagePlain: text => doSendMessage(text, false),
  insertText,
  setBarFocus,
  append: message => {
   elMessage.value += message;
   resizeMessage();
  },
 });

 export async function insertText(text) {
  /* insert text at the current cursor position */
  console.log('elMessage.selectionStart:', elMessage.selectionStart);
  const start = elMessage.selectionStart;
  const end = elMessage.selectionEnd;
  elMessage.value = elMessage.value.substring(0, start) + text + elMessage.value.substring(end);
  resizeMessage();
  elMessage.selectionStart = start + text.length;
  elMessage.selectionEnd = start + text.length;
  console.log('elMessage.selectionStart:', elMessage.selectionStart);
 }

 export async function doSendMessage(message, html) {
  //console.log('doSendMessage', message);
  //await sendMessage(html ? message : messagebar_text_to_html(message));
  await sendMessage(message, html ? 'html' : 'plaintext');
  await setBarFocus();
 }

 export async function setBarFocus() {
  await tick();
  console.log('setBarFocus');
  if (elMessage) elMessage.focus();
 }

 function resizeMessage() {
  const maxHeight = 200;
  const textarea = elMessage;
  textarea.style.height = 'auto'; // ?
  textarea.style.height = (textarea.scrollHeight < maxHeight ? textarea.scrollHeight : maxHeight) + 'px';
  if (elMessage.scrollHeight > maxHeight) elMessage.style.overflowY = 'scroll';
  else elMessage.style.overflowY = 'hidden';
 }

 export function dispatchEvent(event) {
  text = event.key;
 }

 function clickSend(event) {
  if (elMessage.value) {
   doSendMessage(elMessage.value, false);
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

<div class="message-bar" bind:this={elMessageBar}>
 <div bind:this={elAttachment}>
  <Icon img="modules/{identifier}/img/attachment.svg" alt="Attachment" size="32" padding="0" />
 </div>
 <BaseButton onClick={() => (showExpressions = !showExpressions)}>
  <div bind:this={elExpressions}>
   <Icon img="modules/{identifier}/img/emoji.svg" alt="Emoji" size="32" padding="0" />
  </div>
 </BaseButton>
 <!--
 <span class="message" bind:innerHTML={text} bind:this={elMessage} placeholder="Enter your message ..." on:input={resizeMessage} on:keydown={keyEnter} contenteditable></span>
 -->
 <textarea class="message" bind:value={text} bind:this={elMessage} rows="1" placeholder="Enter your message ..." on:input={resizeMessage} on:keydown={keyEnter}></textarea>
 <Icon img="modules/{identifier}/img/mic.svg" alt="Record voice message" size="32" padding="0" onClick={clickRecord} />
 <Icon img="modules/{identifier}/img/send.svg" alt="Send" size="32" padding="0" onClick={clickSend} />
</div>

<ContextMenu target={elAttachment} disableRightClick={true} bottomOffset={elMessageBar?.getBoundingClientRect().height}>
 <ContextMenuItem img="modules/{identifier}/img/file.svg" label="File" onClick={sendFile} />
 <ContextMenuItem img="modules/{identifier}/img/html.svg" label="HTML" onClick={sendHTML} />
 <ContextMenuItem img="modules/{identifier}/img/map.svg" label="Location" onClick={sendLocation} />
</ContextMenu>

<ContextMenu target={elExpressions} width="380px" height={expressionsHeight} scrollable={false} disableRightClick={true} bottomOffset={elMessageBar?.getBoundingClientRect().height}>
 <Expressions height={expressionsHeight} />
</ContextMenu>

<!--
<Modal body={Expressions} width="363px" bind:show={showExpressions} />
-->

<Modal title="HTML composer" body={ModalHTML} bind:show={showHTMLModal} />
