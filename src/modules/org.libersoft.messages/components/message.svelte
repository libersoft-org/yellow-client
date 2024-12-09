<script>
 import { setMessageSeen, saneHtml, snipeMessage, startReply } from '../messages.js';
 import { debug } from '../../../core/core.js';
 import { onDestroy, onMount } from 'svelte';
 import { isClientFocused } from '../../../core/core.js';
 import ContextMenu from '../../../core/components/context-menu.svelte';
 import ContextMenuItem from '../../../core/components/context-menu-item.svelte';
 import Audio from './audio.svelte';
 //import Video from './video.svelte';
 //import FileTransfer from './filetransfer.svelte';
 //import Reply from './message-reply.svelte';
 import Sticker from './sticker.svelte';
 export let message;
 export let container_element;
 let seen_txt;
 let checkmarks;
 let observer;
 let intersection_observer_element;
 let is_visible;
 let elCaret;
 let menu;
 let elMessage;
 let touchStartX = 0;
 let touchCurrentX = 0;
 let touchCurrentTranslation = 0;
 let touchThreshold = 50;
 let touchMaxTranslation = 80;
 let moving;
 let longPressTimer;
 let thisWasALongPress;
 let touchX;
 let touchY;

 $: checkmarks = message.seen ? '2' : message.received_by_my_homeserver ? '1' : '0';
 $: seen_txt = message.seen ? 'Seen' : message.received_by_my_homeserver ? 'Sent' : 'Sending';
 $: checkmarks_img = 'modules/org.libersoft.messages/img/seen' + checkmarks + '.svg';
 //$: console.log('Core.isClientFocused:', $isClientFocused);
 $: if (is_visible && $isClientFocused) {
  console.log('is_visible:', is_visible, 'isClientFocused:', $isClientFocused);
  if (message.seen) {
   console.log('not setting seen because already set');
   observer.disconnect();
   is_visible = false;
  } else {
   console.log('setMessageSeen..');
   setMessageSeen(message, () => {
    console.log('seen set succesfully, disconnecting observer.');
    observer.disconnect();
    is_visible = false;
   });
  }
 }

 function processMessage(content) {
  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  //console.log('containsHtml:', containsHtml);
  return containsHtml ? saneHtml(content) : linkify(content.replaceAll(' ', '&nbsp;')).replaceAll('\n', '<br />');
 }

 function linkify(text) {
  // Combine all patterns into one. We use non-capturing groups (?:) to avoid capturing groups we don't need.
  const combinedPattern = new RegExp(["(https?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})?(?::\\d+)?(?:\\/[^\\s]*)?)", "(ftps?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})?(?::\\d+)?(?:\\/[^\\s]*)?)", '(bitcoin:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)', '(ethereum:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)', '(mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})', '(tel:\\+?[0-9]{1,15})'].join('|'), 'g');
  return text.replace(combinedPattern, match => {
   // Directly use `match` as the URL/href. This ensures we handle all links in one pass.
   return `<a href="${match}" target="_blank">${match}</a>`;
  });
 }

 function handleTouchStart(e) {
  //console.log('handle touch start', e);
  moving = false;
  touchX = e.changedTouches[0].clientX;
  touchY = e.changedTouches[0].clientY;

  thisWasALongPress = false;
  //e.preventDefault();
  longPressTimer = setTimeout(() => {
   if (!moving) {
    thisWasALongPress = true;
    alert('Long press');
   }
  }, 500);
  touchStartX = e.changedTouches[0].clientX;
  touchCurrentX = touchStartX;
  touchCurrentTranslation = 0;
  elMessage.style.transition = 'none';
 }

 function handleTouchMove(e) {
  //console.log('handle touch move', e);
  //e.preventDefault();
  moving = true;
  touchCurrentX = e.changedTouches[0].clientX;
  let diff = touchCurrentX - touchStartX;
  if (!message.is_outgoing) {
   // move to the right
   if (diff < 0) diff = 0;
   if (diff > touchMaxTranslation) diff = touchMaxTranslation;
  } else {
   // move to the left
   if (diff > 0) diff = 0;
   if (diff < -touchMaxTranslation) diff = -touchMaxTranslation;
  }
  touchCurrentTranslation = diff;
  elMessage.style.transform = `translateX(${touchCurrentTranslation}px)`;
 }

 function handleTouchEnd(e) {
  //console.log('handle touch end', e);
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

 onMount(() => {
  //console.log('onMount message:', message);
  if (!message.seen && !message.just_sent) {
   if (message.is_outgoing && !(message.address_to === message.address_from)) {
    console.log('no need to set seen');
    return;
   }
   console.log('create observer');
   observer = new IntersectionObserver(
    entries => {
     console.log(entries);
     is_visible = entries[0].isIntersecting;
    },
    { touchThreshold: 0.8, root: container_element }
   );
   observer.observe(intersection_observer_element);
  }
 });

 onDestroy(() => {
  if (observer) observer.disconnect();
 });

 function replyMessage() {
  console.log('reply');
  startReply(message);
 }

 function forwardMessage() {
  console.log('forward');
 }

 function deleteMessage() {
  console.log('delete');
  snipeMessage(message);
 }

 function copyMessage() {
  console.log('copy');
 }
</script>

<style>
 .message {
  position: relative;
  max-width: 60%;
  padding: 10px;
  margin: 10px 20px;
  border-radius: 10px;
  box-shadow: var(--shadow);

  /* Maybe not necessary: */
  transform: translateX(0);
  will-change: transform;
 }

 .message.incoming {
  background-color: #fef3c3;
  align-self: flex-start;
 }

 .message.outgoing {
  background-color: #fefdf7;
  align-self: flex-end;
 }

 .message .text {
  padding-bottom: 10px;
  word-break: break-word;
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

 .message .menu {
  display: none;
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  padding: 5px;
  cursor: pointer;
  border-radius: 10px;
  background-color: #fefdf7;
  border: 1px solid #cecdc7;
 }

 @media (hover: hover) and (pointer: fine) {
  .message:hover .menu {
   display: flex;
  }
 }
</style>

<div class="message {message.is_outgoing ? 'outgoing' : 'incoming'}" bind:this={elMessage} on:touchstart={handleTouchStart} on:touchend={handleTouchEnd} on:touchmove={handleTouchMove}>
 <div bind:this={intersection_observer_element}></div>
 <div class="menu" role="button" tabindex="0" bind:this={elCaret}>
  <img src="img/caret-down-gray.svg" alt="Menu" />
 </div>
 <!-- <Reply name="Someone" text="Some text" /> -->
 <!-- <Audio file="modules/org.libersoft.messages/audio/message.mp3" />-->
 <!--<Video file="https://file-examples.com/storage/fe3abb0cc967520c59b97f1/2017/04/file_example_MP4_1920_18MG.mp4" />-->
 <!--<FileTransfer file="text.mp4" uploaded="10485760000" total="20000000000" />-->
 <Sticker file="https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/lottie.json" />
 <Sticker file="https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/512.webp" />
 <div class="text">{@html processMessage(message.message)}</div>
 <div class="bottomline">
  <div class="time">{new Date(message.created /*.replace(' ', 'T') + 'Z'*/).toLocaleString()}</div>
  {#if message.is_outgoing}
   <div class="checkmark"><img src={checkmarks_img} alt={seen_txt} /></div>
  {/if}
 </div>

 {#if $debug}
  id {message.id}
 {/if}
</div>

{#if message.reply}
 <div class="reply-box">
  <input type="text" value={message.reply.text} />
 </div>
{/if}

<ContextMenu bind:this={menu} target={elCaret}>
 <ContextMenuItem img="img/copy.svg" label="Copy" on:click={() => copyMessage()} />
 <ContextMenuItem img="modules/org.libersoft.messages/img/reply.svg" label="Reply" on:click={() => replyMessage()} />
 <ContextMenuItem img="modules/org.libersoft.messages/img/forward.svg" label="Forward" on:click={() => forwardMessage()} />
 <ContextMenuItem img="modules/org.libersoft.messages/img/delete.svg" label="Delete" on:click={() => deleteMessage()} />
</ContextMenu>
