<script>
 import { deleteMessage, identifier, processMessage, setMessageSeen, snipeMessage, startReply } from '../messages.js';
 import { debug } from '../../../core/core.js';
 import { onDestroy, onMount, tick } from 'svelte';
 import { isClientFocused } from '../../../core/core.js';
 import { stripHtml } from '../messages.js';
 import ContextMenu from '../../../core/components/context-menu.svelte';
 import ContextMenuItem from '../../../core/components/context-menu-item.svelte';
 // import Image from './image.svelte';
 // import Audio from './audio.svelte';
 // import Video from './video.svelte';
 //import FileTransfer from './filetransfer.svelte';
 // import Map from './map.svelte';
 import MessageRendering from './message-rendering.svelte';
 // import Reply from './msgReply/Reply.svelte';
 import messageBarReplyStore, { ReplyToType } from '@/org.libersoft.messages/stores/MessageBarReply.store.ts';
 import forwardMessageStore from '@/org.libersoft.messages/stores/ForwardMessage.store.ts';

 export let message;
 export let elContainer;

 export let enableScroll;
 export let disableScroll;

 export function getRef() {
  return elMessage;
 }

 let seenTxt;
 let checkmarks;
 let observer;
 let elIntersectionObserver;
 let isVisible;
 let elCaret;
 let menu;
 let elMessage;
 let touchStartX = 0;
 let touchStartY = 0;
 let touchCurrentX = 0;
 let touchCurrentY = 0;
 let touchCurrentTranslation = 0;
 let touchThreshold = 50;
 let touchMaxTranslation = 80;
 let moving;
 let longPressTimer;
 let thisWasALongPress;
 let thisWasASwipe;
 let thisWasAScroll;
 let touchX;
 let touchY;
 let messageContent;

 $: update(message);
 // console.log('updated message:', message);
 function update(message) {
  if (messageContent) return;
  //  console.log('update message:', message);
  messageContent = processMessage(message);
 }

 //$: console.log('messageContent:', messageContent);
 $: checkmarks = message.seen ? '2' : message.received_by_my_homeserver ? '1' : '0';
 $: seenTxt = message.seen ? 'Seen' : message.received_by_my_homeserver ? 'Sent' : 'Sending';
 $: checkmarks_img = 'modules/' + identifier + '/img/seen' + checkmarks + '.svg';
 //$: console.log('Core.isClientFocused:', $isClientFocused);
 $: if (isVisible && $isClientFocused) {
  console.log('isVisible:', isVisible, 'isClientFocused:', $isClientFocused);
  if (message.seen) {
   console.log('not setting seen because already set');
   observer.disconnect();
   isVisible = false;
  } else {
   console.log('setMessageSeen..');
   setMessageSeen(message, () => {
    console.log('seen set succesfully, disconnecting observer.');
    observer.disconnect();
    isVisible = false;
   });
  }
 }

 function handleTouchStart(e) {
  //console.log('handle touch start', e);
  moving = false;
  touchX = e.changedTouches[0].clientX;
  touchY = e.changedTouches[0].clientY;
  thisWasALongPress = false;
  thisWasASwipe = false;
  thisWasAScroll = false;
  longPressTimer = setTimeout(() => {
   if (!moving) {
    thisWasALongPress = true;
    console.log('Long press');
   }
  }, 500);
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
  touchCurrentX = touchStartX;
  touchCurrentY = touchStartY;
  touchCurrentTranslation = 0;
  elMessage.style.transition = 'none';
 }

 function handleTouchMove(e) {
  //console.log('handle touch move', e);
  moving = true;
  touchCurrentX = e.changedTouches[0].clientX;
  touchCurrentY = e.changedTouches[0].clientY;
  let diffX = touchCurrentX - touchStartX;
  let diffY = touchCurrentY - touchStartY;

  // horizontal limits
  if (!message.is_outgoing) {
   // move to the right
   if (diffX < 0) diffX = 0;
   if (diffX > touchMaxTranslation) diffX = touchMaxTranslation;
  } else {
   // move to the left
   if (diffX > 0) diffX = 0;
   if (diffX < -touchMaxTranslation) diffX = -touchMaxTranslation;
  }

  if (thisWasAScroll) {
   diffX = 0;
  }

  touchCurrentTranslation = diffX;
  elMessage.style.transform = `translateX(${touchCurrentTranslation}px)`;

  if (Math.abs(diffX) > 10) {
   thisWasASwipe = true;
   disableScroll();
  } else if (!thisWasASwipe && Math.abs(diffY) > 10) {
   thisWasAScroll = true;
  }
 }

 function handleTouchEnd(e) {
  //console.log('handle touch end', e);
  enableScroll();
  if (longPressTimer) {
   clearTimeout(longPressTimer);
   longPressTimer = null;
  }
  if (!moving && !thisWasALongPress) {
   console.log('Short press:', e, e.x, e.y);
   e.x = touchX;
   e.y = touchY;
   menu.openMenu(e);
  }
  let diff = touchCurrentTranslation;
  elMessage.style.transition = 'transform 0.2s ease-out';
  if ((!message.is_outgoing && diff > touchThreshold) || (message.is_outgoing && diff < -touchThreshold)) {
   replyMessage();
   touchCurrentTranslation = 0;
   elMessage.style.transform = `translateX(${touchCurrentTranslation}px)`;
  } else {
   touchCurrentTranslation = 0;
   elMessage.style.transform = `translateX(${touchCurrentTranslation}px)`;
  }
 }

 /*
 let supportsPassive = false;

 let wheelOpt;
 $: wheelOpt = supportsPassive ? { passive: false } : false;

 function configurePassive() {
  try {
   window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () {
     supportsPassive = true;
    }
   }));
  } catch (e) {
  }
 }*/
 /*
 function onScroll(e) {
  console.log('scroll', e);
  e.preventDefault();
  e.stopPropagation();
 }
*/
 onMount(() => {
  console.log('onMount message:', message);
  /*configurePassive();
  window.addEventListener('touchmove', e => {
   //if (thisWasASwipe)
   e.preventDefault();
  }, wheelOpt);*/

  if (!message.seen && !message.just_sent) {
   if (message.is_outgoing && !(message.address_to === message.address_from)) {
    console.log('no need to set seen');
    return;
   }
   //console.log('create observer');
   observer = new IntersectionObserver(
    async entries => {
     //console.log(entries);
     entries.sort((a, b) => a.time - b.time);
     for (let entry of entries) {
      isVisible = entries[0].isIntersecting;
      await tick();
     }
    },
    /*
    TODO: split long messages into parts and "collect" seen status
     */
    { threshold: 0.8, root: elContainer }
   );
   observer.observe(elIntersectionObserver);
  }
 });

 onDestroy(() => {
  //console.log('onDestroy message:', message);
  if (observer) observer.disconnect();
 });

 function replyMessage() {
  console.log('reply', message);
  // startReply(message);
  messageBarReplyStore.startReplyTo({
   type: ReplyToType.MESSAGE,
   data: message,
  });
  document.getElementById('message-input')?.focus();
 }

 function forwardMessage() {
  console.log('forward');
  forwardMessageStore.startForwardedMessage({
   type: ReplyToType.MESSAGE,
   data: message,
  });
 }

 function onMessageDelete() {
  console.log('delete');
  deleteMessage(message);
 }

 function copyTextOnly() {
  console.log('copy stripHtml');
  navigator.clipboard.writeText(stripHtml(message.message));
 }

 function copyOriginal() {
  console.log('copy original');
  console.log(message.message);
  navigator.clipboard.writeText(message.message);
 }

 function copyMessageHTML() {
  console.log('copyMessagePseudoHtml');
  console.log(messageContent);

  //const serialized = new XMLSerializer().serializeToString(messageContent.body);

  const tempContainer = document.createElement('div');
  tempContainer.appendChild(messageContent.body);
  const serialized = tempContainer.innerHTML;

  navigator.clipboard.writeText(serialized);
 }

 async function rightClickContextMenu(e) {
  // for dev purposes: if you want to use native context menu (right mouse click) instead of app's in message list
  if (import.meta.env.VITE_FORCE_NATIVE_CONTEXT_MENU) {
   //return;
  }
  e.preventDefault();
  console.log('Message click:', e);
  console.log('Message click:', menu);
  console.log('Message click:', menu.openMenu);
  await menu.openMenu(e);
 }
</script>

<style>
 .message {
  --animation-highlight-duration: 0.7s;
  position: relative;
  max-width: 60%;
  padding: 10px;
  margin: 10px 20px;
  border-radius: 10px;
  box-shadow: var(--shadow);
  /* TODO: Maybe not necessary: */
  /*transform: translateX(0);*/
  will-change: transform;
  animation: messageAppear 0.3s ease-out;
 }

 @keyframes messageAppear {
  from {
   transform: scale(0);
   /*transform: translateX(100%);*/
   /*transform: translateY(100%);*/
  }
  to {
   transform: scale(1);
   /*transform: translateX(0);*/
   /*transform: translateY(0);*/
  }
 }

 .message.incoming {
  align-self: flex-start;
  border: 1px solid #aa5;
  background-color: #fef3c3;
 }

 .message.outgoing {
  align-self: flex-end;
  border: 1px solid #aaa;
  background-color: #fefdf7;
 }

 :global(.message .text a) {
  font-weight: bold;
  text-decoration: none;
  color: #a60;
 }

 :global(.message .text img) {
  max-width: 100%;
 }

 .message .bottomline {
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 5px;
 }

 .message .bottomline .time {
  font-size: 12px;
 }

 .message .bottomline .checkmark img {
  width: 24px;
  height: 24px;
 }

 .debug {
  word-break: break-word;
 }
</style>

<div class="message {message.is_outgoing ? 'outgoing' : 'incoming'}" bind:this={elMessage} role="button" tabindex="0" on:touchstart={handleTouchStart} on:touchend={handleTouchEnd} on:touchmove={handleTouchMove} on:contextmenu={rightClickContextMenu}>
 <div bind:this={elIntersectionObserver}></div>
 <!--<Reply name="Someone" text="Some text" />-->
 <!--<Image file="https://cdn.britannica.com/87/196687-138-2D734164/facts-parrots.jpg" />-->
 <!--<Audio file="modules/{identifier}/audio/message.mp3" />-->
 <!--<Video file="https://file-examples.com/storage/fe3abb0cc967520c59b97f1/2017/04/file_example_MP4_1920_18MG.mp4" />-->
 <!--<Map latitude="50.0755", longitude="14.4378" />-->
 <!--<FileTransfer file="text.mp4" uploaded="10485760000" total="20000000000" />-->
 {#if $debug}
  <div class="debug">
   <span class="bold">Original</span> (ID: <span class="bold">{message.id}</span>, format: <span class="bold">{message.format}</span>):<br /><br />
   {message.message}<br />
   {JSON.stringify(message, null, 2)}<br />
   <hr />
   <span class="bold">Rendering</span>:<br /><br />
  </div>
 {:else}{/if}
 <MessageRendering {messageContent} />
 <!--
 <div class="text">{@html 'processMessage(message.message)'}</div>
 <div class="text">{@html '<b>srtrstr'}</div>
 <div class="text">{@html 'srtrstr'}</div>
 <div class="text">{@html '<hr/>'}</div>
 -->
 <div class="bottomline">
  <div class="time">{new Date(message.created /*.replace(' ', 'T') + 'Z'*/).toLocaleString()}</div>
  {#if message.is_outgoing}
   <div class="checkmark"><img src={checkmarks_img} alt={seenTxt} /></div>
  {/if}
 </div>
</div>
{#if message.reply}
 <div class="reply-box">
  <input type="text" value={message.reply.text} />
 </div>
{/if}
<ContextMenu bind:this={menu} target={elCaret}>
 <ContextMenuItem img="img/copy.svg" label="Copy original" onClick={copyOriginal} />
 <ContextMenuItem img="img/copy.svg" label="Copy text only" onClick={copyTextOnly} />
 <ContextMenuItem img="img/copy.svg" label="Copy HTML" onClick={copyMessageHTML} />
 <ContextMenuItem img="modules/{identifier}/img/reply.svg" label="Reply" onClick={replyMessage} />
 <ContextMenuItem img="modules/{identifier}/img/forward.svg" label="Forward" onClick={forwardMessage} />
 <ContextMenuItem img="modules/{identifier}/img/delete.svg" label="Delete" onClick={onMessageDelete} />
</ContextMenu>
