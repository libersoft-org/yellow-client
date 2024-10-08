<script>
 import { afterUpdate, beforeUpdate, onMount } from 'svelte';
 import Message from './message.svelte';
 import { messagesArray } from '../messages.js';
 import { active_account } from '../../../core/core.js';

 $: console.log('messages-list.svelte: messagesArray: ', $messagesArray);

 let messages_elem;
 let wasScrolledToBottom = true;

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
 $: updateItems($messagesArray);

 function updateItems(messagesArray) {
  console.log('updateItems');
  items.length = 0;
  let unseen_marker_placed = false;
  for (let message of messagesArray.toReversed()) {
   if (!unseen_marker_placed && !message.is_outgoing && (message.is_unseen_marker_anchor || !message.seen)) {
    message.is_unseen_marker_anchor = true;
    unseen_marker_placed = true;
    items.push({ uid: 'unseen_marker', type: 'unseen_marker' });
   }
   items.push(message);
  }
  items.reverse();
 }
</script>

<div class="messages" bind:this={messages_elem}>
 {#each items as m (m.uid)}
  {#if m.type === 'unseen_marker'}
   <div class="unseen-marker">=v=v=v=v=v=Unseen messages=v=v=v=v=v=</div>
  {:else}
   <Message message={m} container_element={messages_elem} />
  {/if}
 {/each}
</div>

<style>
 .messages {
  display: flex;
  flex-direction: column-reverse;
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
 }
</style>
