<script>
 import {afterUpdate, beforeUpdate, onMount} from 'svelte';
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
  if (wasScrolledToBottom) scrollToBottom()
 });

 onMount(() => {
  //setInterval(() => updateWasScrolledToBottom(), 1000);
 });

 function scrollToBottom() {
  // TODO: fixme: sometimes does not scroll to bottom properly when two messages appear at once
  if (messages_elem) messages_elem.scrollTop = messages_elem.scrollHeight;
 }
</script>

<style>
 .messages {
  display: flex;
  flex-direction: column-reverse;
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
 }
</style>

<div class="messages" bind:this={messages_elem}>
 {#each $messagesArray as m (m.uid)}
  <!-- <pre>{JSON.stringify(m, null, 2)}</pre> -->
  <Message message={m} isOutgoing={m.address_from === $active_account.credentials.address } container_element="{messages_elem}" />
 {/each}
</div>
