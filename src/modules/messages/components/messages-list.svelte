<script>
 import { afterUpdate, beforeUpdate, onMount } from 'svelte';
 import Message from './message.svelte';
 import { messagesArray } from '../messages.js';

 export let message_bar;

 let messages_elem;
 let wasScrolledToBottom = true;

 $: console.log('messages-list.svelte: messagesArray: ', $messagesArray);

 function updateWasScrolledToBottom() {
  if (messages_elem) {
   wasScrolledToBottom = messages_elem.scrollTop > -1;
  }
 }

 beforeUpdate(() => {
  updateWasScrolledToBottom();
 });

 afterUpdate(() => {
  console.log('afterUpdate: wasScrolledToBottom:', wasScrolledToBottom);
  if (wasScrolledToBottom) scrollToBottom();
 });

 onMount(() => {
  //setInterval(() => updateWasScrolledToBottom(), 1000);
 });

 function scrollToBottom() {
  // TODO: fixme: sometimes does not scroll to bottom properly when two messages appear at once
  if (messages_elem) messages_elem.scrollTop = messages_elem.scrollHeight;
 }

 let items = [];
 $: items = getItems($messagesArray);

 function mergeAuthorship(messagesArray) {
  let items = [];
  let lastAuthor = null;
  for (let i = 0; i < messagesArray.length; i++) {
   items.push(message);
   if (message.type === 'message') {
    if (lastAuthor == message.author) {
     message.hide_author = true;
    }
   }
   lastAuthor = message.author;
  }
  return items;
 }

 function getItems(messagesArray) {
  if (messagesArray.length === 0) return [{type: 'no_messages'];
  if (messagesArray.length === 1 && messagesArray[0].type === 'initial_loading_placeholder') return messagesArray;

  messagesArray = mergeAuthorship(messagesArray);
  let items = [];

  for (let m of messagesArray)
   if (typeof m !== Message)
    throw new Error('Invalid item: ' + m);

  // messages are sorted in correct order at this point.
  // add lazyloaders where there is discontinuity.

  // add a loader at the top if first message is not the first message in the chat
  if (messagesArray[0].prev !== 'none') {
   items.unshift({ type: 'loader', prev: 10, base: messagesArray[0].id });
  }

  // walk all messages, add loaders where there are discontinuities
  for (let i = 0; i < messagesArray.length - 2; i++) {
   let m = messagesArray[i];
   items.push(m);
   let next = messagesArray[i + 1];
   if (m.next !== next.id) {
    items.push({
     type: 'hole',
     top: { type: 'loader', next: 10, base: m.id },
     bottom: { type: 'loader', prev: 10, base: next.id }
    });
   }
  }

  if (messagesArray[messagesArray.length - 1].next !== 'none') {
   items.push({ type: 'loader', next: 10, base: messagesArray[messagesArray.length - 1].id });
  }

  items.reverse();
  return items;
 }

 function removeUnusedHoles(items) {
  if (items?.[0].type === 'hole') {
   if (items?.[1].is_first) {
    items.delete(0);
   }
  }
  if (items?.[items.length - 1].type === 'hole') {
   if (items?.[items.length - 2].is_last) {
    items.delete(items.length - 1);
   }
  }
 }


   async function mouseDown(event) {
  console.log('event:', event);
  event.preventDefault();
  console.log('mouseDown');
  if (message_bar) await message_bar.setBarFocus();
  console.log('1message_bar:', message_bar);
 }
</script>

<style>
 .messages {
  display: flex;
  flex-direction: column-reverse;
  flex-grow: 1;
  overflow-y: auto;
 }

 .unread {
  display: flex;
  justify-content: center;
  background-color: #fffcf0;
  border: 1px solid #dd9;
  padding: 10px 0;
  box-shadow: var(--shadow);
 }
</style>

<div class="messages" role="none" bind:this={messages_elem} on:mousedown={mouseDown}>
 {#each items as m (m.uid)}
  {#if m.type === 'unseen_marker'}
   <div class="unread">Unread messages</div>
  {:else}
   <Message message={m} container_element={messages_elem} />
  {/if}
 {/each}
</div>
