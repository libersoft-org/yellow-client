<script>
 import { afterUpdate } from 'svelte';
 import Core from '../../../core/core.js';
 import { messagesArray } from '../messages.js';
 import Message from './message.svelte';
 let messages;

 afterUpdate(() => scrollToBottom());

 function scrollToBottom() {
  if (messages) messages.scrollTop = messages.scrollHeight;
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

<div class="messages" bind:this={messages}>
 {#each $messagesArray as m}
  <Message {m} message={m} isOutgoing={m.address_from === Core.userAddress} />
 {/each}
</div>
