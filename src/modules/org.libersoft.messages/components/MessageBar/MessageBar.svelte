<script>
 import { keyboardHeight, documentHeight, debug, isMobile, debugBuffer, active_account } from '@/core/core.js';
 import { handleResize, identifier, initUpload, sendMessage, selectedConversation } from '../../messages.js';
 import { onMount, setContext, tick, getContext } from 'svelte';
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import ContextMenu from '@/core/components/ContextMenu/ContextMenu.svelte';
 import ContextMenuItem from '@/core/components/ContextMenu/ContextMenuItem.svelte';
 import Modal from '@/core/components/Modal/Modal.svelte';
 import ModalHtml from '../../modals/Html.svelte';
 import ModalFileUpload from '../../modals/FileUpload.svelte';
 import Expressions from '../Expressions/Expressions.svelte';
 import { init_emojis } from '../../emojis.js';
 import { get } from 'svelte/store';
 import MessageBarRecorder from './MessageBarRecorder.svelte';
 import audioRecorderStore from '@/org.libersoft.messages/stores/AudioRecorderStore.ts';
 import MessageBarReply from '@/org.libersoft.messages/components/MessageBar/MessageBarReply.svelte';
 import messageBarReplyStore, { ReplyToType } from '@/org.libersoft.messages/stores/MessageBarReplyStore.ts';
 import { FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.ts';


 let expressionsMenu;
 let elBottomSheet;
 let elAttachment;
 let elExpressions;
 let elMessage;
 let elMessageBar;
 let text;
 let expressions;
 let showHTMLModal = false;
 let expressionsHeight = '500px';
 let expressionsBottomSheetOpen = false;
 let expressionsAsContextMenu = true;
 let lastDocumentHeight = 0;
 let videoInputRef;

 isMobile.subscribe(value => {
  expressionsAsContextMenu = !value;
  expressionsHeight = value ? '250px' : '500px';
 });

 documentHeight.subscribe(value => {
  if (value != lastDocumentHeight) {
   //if (value < lastDocumentHeight - 100) expressionsBottomSheetOpen = false;
   lastDocumentHeight = value;
  }
 });

 onMount(async () => {
  console.log('MessageBar mounted');
  await init_emojis();
  /*setInterval(() => {
   let v = get(debugBuffer);
   if (v == '') return;
   v = v.substring(0, 65500);
   doSendMessage(v, false);
   debugBuffer.set('');
  }, 10000);*/
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

 export async function openExpressions(tab) {
  console.log('openExpressions', tab);
  if (expressionsAsContextMenu) {
   console.log('openExpressions as context menu:', expressionsMenu);
   console.log('elExpressions.offsetLeft:', elExpressions.offsetLeft, 'elExpressions.offsetTop:', elExpressions.offsetTop, 'elExpressions.offsetWidth:', elExpressions.offsetWidth, 'elExpressions.offsetHeight:', elExpressions.offsetHeight);
   expressionsMenu?.openMenu({ x: elExpressions.getBoundingClientRect().x, y: 0 });
  } else {
   expressionsBottomSheetOpen = true;
  }
  await tick();
  console.log('elExpressions:', elExpressions);
  await expressions?.setCategory(null, tab);
 }

 export async function insertText(text) {
  /* insert text at the current cursor position */
  //console.log('elMessage.selectionStart:', elMessage.selectionStart);
  const start = elMessage.selectionStart;
  const end = elMessage.selectionEnd;
  elMessage.value = elMessage.value.substring(0, start) + text + elMessage.value.substring(end);
  resizeMessage();
  //if (expressionsBottomSheetOpen) return;
  elMessage.selectionStart = start + text.length;
  elMessage.selectionEnd = start + text.length;
  //console.log('elMessage.selectionStart:', elMessage.selectionStart);
  setBarFocus();
 }

 export async function doSendMessage(message, html) {
  //console.log('doSendMessage', message);
  //await sendMessage(html ? message : messagebar_text_to_html(message));
  await sendMessage(message, html ? 'html' : 'plaintext');
  await setBarFocus();
  closeExpressions();
 }

 export async function setBarFocus() {
  if (expressionsBottomSheetOpen) return;
  await tick();
  //console.log('setBarFocus');
  if (elMessage) elMessage.focus();
 }

 function resizeMessage() {
  //console.log('resizeMessage');
  handleResize(true /*todo save*/);
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

 const isMessageReplyOpen = messageBarReplyStore.isOpen();
 const replyTo = messageBarReplyStore.getReplyTo();

 function clickSend(event) {
  let messageToSend = elMessage.value;
  if (messageToSend && $replyTo && $replyTo.type === ReplyToType.MESSAGE) {
   const replyToMessageUid = $replyTo?.data?.uid;
   messageToSend = `<Reply id="${replyToMessageUid}"></Reply>${messageToSend}`;
   doSendMessage(messageToSend, true);
  } else if (messageToSend) {
   doSendMessage(messageToSend, false);
  }
  elMessage.value = '';
  resizeMessage(event);
  elMessage.focus();
  messageBarReplyStore.close();
 }

 function keyEnter(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
   event.preventDefault();
   clickSend(event);
  }
  if (event.key === 'Escape') {
   if (expressionsBottomSheetOpen || (expressionsMenu && get(expressionsMenu.isOpen))) {
    event.preventDefault();
    event.stopPropagation();
    closeExpressions();
   }
  }
 }

 function clickRecord(event) {
  console.log('clicked on record mic / camera - long press to record, short press to switch mic / camera');
 }

 function sendHTML() {
  showHTMLModal = true;
 }

 function sendLocation() {
  console.log('clicked on location');
 }

 let { showFileUploadModal, setFileUploadModal } = getContext('FileUploadModal');

 isMobile.subscribe(value => {
  expressionsAsContextMenu = !value;
 });

 documentHeight.subscribe(value => {
  handleResize(true); // todo: save wasScrolledToBottom2 before showing bottom sheet /// periodically?
 });

 keyboardHeight.subscribe(value => {
  console.log('keyboardHeight:', value);
  if (value > 100) {
   if (get(isMobile)) {
    console.log('adjusting expressionsHeight from keyboardHeight:', value);
    expressionsHeight = value + 'px';
   }
  }
 });

 $: expressionsAsContextMenuUpdate(expressionsAsContextMenu);
 function expressionsAsContextMenuUpdate(expressionsAsContextMenu) {
  closeExpressions();
 }

 function closeExpressions() {
  //console.log('closeExpressions');
  //if (expressionsBottomSheetOpen) handleResize(true); // todo: save wasScrolledToBottom2 before showing bottom sheet
  expressionsBottomSheetOpen = false;
  expressionsMenu?.close();
 }

 $: update2(expressionsAsContextMenu, expressionsBottomSheetOpen);
 function update2(expressionsAsContextMenu, expressionsBottomSheetOpen) {
  if (!expressionsAsContextMenu && expressionsBottomSheetOpen) {
   elMessage.blur();
  }
 }

 function elMessageBlur(event) {
  //console.log('elMessageBlur');
  if (elBottomSheet?.contains(event.relatedTarget)) return;
  expressionsBottomSheetOpen = false;
 }

 const onVideoRecordClick = async () => {
  videoInputRef.click()
 };

 onMount(() => {
  videoInputRef.addEventListener('change', function (event) {
   console.log('event.target.files', event.target.files);
   const recipientEmail = get(selectedConversation).address;
   const file = event.target.files[0]; // Get the selected video file
   if (file) {
    // const url = URL.createObjectURL(file); // Create a URL for the video file
    // videoPreview.src = url;
    // videoPreview.style.display = "block"; // Show the preview of the video
    initUpload([file], FileUploadRecordType.SERVER, [recipientEmail]);
   }
  });
 });
</script>

<style>
 .message-bar {
  position: sticky;
  bottom: 0;
  background-color: #222;
  box-shadow: var(--shadow);
 }

 .message-bar-main {
  display: flex;
  align-items: end;
  gap: 10px;
  padding: 10px;
 }

 .message-bar-top {
  display: contents;
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

 .bottom-sheet {
  border-radius: 10px;
  border: 10px solid #000;
 }
</style>

<div class="message-bar" bind:this={elMessageBar}>
 <input bind:this={videoInputRef} type="file" id="videoInput" accept="video/*" capture="camera" style:display="none" />

 <div class="message-bar-top">
  {#if $isMessageReplyOpen && $replyTo && $replyTo.type === ReplyToType.MESSAGE}
   <MessageBarReply name={$replyTo?.data?.address_to} replyToMessage={$replyTo?.data?.message} onClose={() => messageBarReplyStore.close()} />
  {/if}
 </div>
 <div class="message-bar-main">
  <MessageBarRecorder />

  <div bind:this={elAttachment} data-testid="attachment-button">
   <Icon img="modules/{identifier}/img/attachment.svg" alt="Attachment" size="32" padding="0" />
  </div>

  {#if expressionsAsContextMenu}
   <div bind:this={elExpressions}>
    <Icon img="modules/{identifier}/img/emoji-yellow.svg" alt="Emoji" size="32" padding="0" />
   </div>
  {:else}
   <BaseButton onClick={() => (expressionsBottomSheetOpen = !expressionsBottomSheetOpen)}>
    <Icon img="modules/{identifier}/img/emoji-yellow.svg" alt="Emoji" size="32" padding="0" />
   </BaseButton>
  {/if}

  <textarea id="message-input" class="message" bind:value={text} bind:this={elMessage} rows="1" placeholder="Enter your message ..." on:input={resizeMessage} on:keydown={keyEnter} on:blur={elMessageBlur}></textarea>
  <!--<Icon img="modules/{identifier}/img/video_message.svg" alt="Record video message" size="32" padding="0" onClick={onVideoRecordClick} />-->
  <Icon img="modules/{identifier}/img/audio_message.svg" alt="Record voice message" size="32" padding="0" onClick={() => audioRecorderStore.setOpen(true)} />
  <Icon img="modules/{identifier}/img/send.svg" alt="Send" size="32" padding="0" onClick={clickSend} />
 </div>
</div>

<ContextMenu target={elAttachment} disableRightClick={true} bottomOffset={elMessageBar?.getBoundingClientRect().height}>
 <ContextMenuItem img="modules/{identifier}/img/video_message-black.svg" label="Video message" onClick={onVideoRecordClick} />
 <ContextMenuItem img="modules/{identifier}/img/file.svg" label="File" onClick={() => setFileUploadModal(true)} data-testid="file-attachment-button" />
 <ContextMenuItem img="modules/{identifier}/img/html.svg" label="HTML" onClick={sendHTML} />
 <ContextMenuItem img="modules/{identifier}/img/map.svg" label="Location" onClick={sendLocation} />
</ContextMenu>

{#if expressionsAsContextMenu}
 <ContextMenu bind:this={expressionsMenu} target={elExpressions} width="380px" height={expressionsHeight} scrollable={false} disableRightClick={true} bottomOffset={elMessageBar?.getBoundingClientRect().height}>
  <Expressions bind:this={expressions} height={expressionsHeight} />
 </ContextMenu>
{/if}

<!--
<Modal body={Expressions} width="363px" bind:show={showExpressions} />
-->

<Modal title="HTML composer" body={ModalHtml} bind:show={showHTMLModal} />
<Modal title="File Upload" body={ModalFileUpload} bind:show={$showFileUploadModal} params={{ setFileUploadModal: setFileUploadModal }} />

{#if $debug}
 <BaseButton
  onClick={() => {
   expressionsAsContextMenu = !expressionsAsContextMenu;
   console.log('expressionsAsContextMenu:', expressionsAsContextMenu, 'expressionsBottomSheetOpen:', expressionsBottomSheetOpen);
  }}
 >
  expressionsBottomSheetOpen: {expressionsBottomSheetOpen}
  expressionsAsContextMenu: {expressionsAsContextMenu}
 </BaseButton>
{/if}

{#if !expressionsAsContextMenu && expressionsBottomSheetOpen}
 <div class="bottom-sheet" style="height: {expressionsHeight};" bind:this={elBottomSheet}>
  <Expressions bind:this={expressions} height={expressionsHeight} isBottomSheet={true} />
 </div>
{/if}
