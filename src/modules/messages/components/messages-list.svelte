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

 function getItems(messagesArray) {
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
