<script>
 import { setMessageSeen, saneHtml, snipeMessage, startReply } from '../messages.js';
 import { debug } from '../../../core/core.js';
 import { onDestroy, onMount } from 'svelte';
 import { isClientFocused } from '../../../core/core.js';
 import Button from '../../../core/components/button.svelte';

 export let message;
 export let container_element;
 let seen_txt;
 let checkmarks;
 let observer;
 let intersection_observer_element;
 let is_visible;

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

 function clickReply() {}

 function keyReply(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickReply();
  }
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
</script>

<style>
 .message {
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

 .message .reply {
  display: flex;
  flex-direction: column;
  padding: 4px 0 4px 10px;
  border: 1px solid #080;
  border-radius: 10px;
  border-left: 8px solid #080;
  margin: 0 0 5px 0;
  cursor: pointer;
 }

 .message .reply .name {
  font-size: 12px;
  font-weight: bold;
  color: #080;
 }

 .message .reply .msg {
  color: #555;
 }

 .reply-box {
  text-align: right;
 }
</style>

<div class="message {message.is_outgoing ? 'outgoing' : 'incoming'}">
 <div bind:this={intersection_observer_element}></div>
 <div class="reply" role="button" tabindex="0" on:click={clickReply} on:keydown={keyReply}>
  <div class="name">Name from</div>
  <div class="msg">Hello</div>
 </div>
 <div class="text">{@html processMessage(message.message)}</div>
 <div class="bottomline">
  <div class="time">{new Date(message.created /*.replace(' ', 'T') + 'Z'*/).toLocaleString()}</div>
  {#if message.is_outgoing}
   <div class="checkmark"><img src={checkmarks_img} alt={seen_txt} /></div>
  {/if}
  <Button
   text="Delete"
   on:click={() => {
    console.log('delete message:', message);
    snipeMessage(message);
   }}
  />
  <Button
   text="Reply"
   on:click={() => {
    console.log('reply to message:', message);
    startReply(message);
   }}
  />
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
