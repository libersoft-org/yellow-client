<script>
 import { setMessageSeen, saneHtml, snipeMessage, startReply } from '../messages.js';
 import { debug } from '../../../core/core.js';
 import { onDestroy, onMount } from 'svelte';
 import { isClientFocused } from '../../../core/core.js';
 import ContextMenu from '../../../core/components/context-menu.svelte';
 import ContextMenuItem from '../../../core/components/context-menu-item.svelte';
 //import Reply from './message-reply.svelte';
 export let message;
 export let container_element;
 let seen_txt;
 let checkmarks;
 let observer;
 let intersection_observer_element;
 let is_visible;
 let pressTimer;
 let contextMenuOpen = false;
 let popoverOpen = false;
 let elCaret;
 let elCaret2;

 $: checkmarks = message.seen ? '2' : message.received_by_my_homeserver ? '1' : '0';
 $: seen_txt = message.seen ? 'Seen' : message.received_by_my_homeserver ? 'Sent' : 'Sending';
 $: checkmarks_img = 'img/seen' + checkmarks + '.svg';

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
  const urlPattern = /(https?:\/\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})?(?::\d+)?(?:\/[^\s]*)?)/g;
  //console.log('linkify:', text);
  let result = text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
  //console.log('linkify result:', result);
  return result;
 }

 function clickCaret() {
  //contextMenuOpen = !contextMenuOpen;
  //console.log('contextMenuOpen:', contextMenuOpen);
 }

 function keyCaret(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickCaret();
  }
 }

 function handleTouchStart() {
  pressTimer = setTimeout(() => {
   alert('Long press detected');
  }, 500);
 }

 function handleTouchEnd() {
  clearTimeout(pressTimer);
 }

 onMount(() => {
  //console.log('onMount message:', message);
  if (!message.seen && !message.just_sent) {
   console.log('create observer');
   observer = new IntersectionObserver(
    entries => {
     console.log(entries);
     is_visible = entries[0].isIntersecting;
    },
    { threshold: 0.8, root: container_element }
   );
   observer.observe(intersection_observer_element);
  }
 });

 onDestroy(() => {
  if (observer) observer.disconnect();
 });

 function reply() {
  console.log('reply');
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

<div class="message {message.is_outgoing ? 'outgoing' : 'incoming'}" on:touchstart={handleTouchStart} on:touchend={handleTouchEnd}>
 <div bind:this={intersection_observer_element}></div>
 <div class="menu" role="button" bind:this={elCaret} tabindex="0" on:click={clickCaret} on:keydown={keyCaret}>
  <img src="img/caret-down-gray.svg" alt="Menu" />
 </div>
 <!--<div class="menu" role="button" bind:this={elCaret2} tabindex="0" on:click={() => {popoverOpen = !popoverOpen }}>
  <img src="img/caret-down-gray.svg" alt="Menu" />
 </div>

 <Popover
    align
    bind:open={popoverOpen}
    on:click:outside={({ detail }) => {
      console.log("on:click:outside");
      contextMenuOpen = elCaret2.contains(detail.target);
    }}
  >
  <ButtonSet stacked>
   <BxButton>hello</BxButton>
   <BxButton>hello</BxButton>
   <BxButton>hello</BxButton>
   <BxButton>hello</BxButton>
   <BxButton>hello</BxButton>
   <BxButton>hello</BxButton>
  </ButtonSet>

 </Popover>
-->

 <!-- <Reply name="Someone" text="Some text" /> -->
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

<ContextMenu target={elCaret}>
 <ContextMenuItem label="Reply" on:click={() => startReply(message)} />
 <ContextMenuItem label="Delete" on:click={() => snipeMessage(message)} />
 <!--
 <ContextMenuOption
  indented
  labelText="Delete"
  on:click={() => {
   snipeMessage(message);
  }}
 />
 <ContextMenuOption
  indented
  labelText="Reply"
  on:click={() => {
   startReply(message);
  }}
 />-->
</ContextMenu>
