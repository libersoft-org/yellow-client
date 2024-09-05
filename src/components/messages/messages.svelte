<script>
 import { afterUpdate } from 'svelte';
 import Message from './message.svelte';
 export let messagesArray = [];
 export let userAddress;
 let messages;

 afterUpdate(() => { scrollToBottom(); });

 function scrollToBottom() {
  if (messages) messages.scrollTop = messages.scrollHeight;
 }
</script>

<style>
 #messages {
  display: flex;
  flex-direction: column-reverse;
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
 }
</style>

<div bind:this={messages} id="messages">
 {#each messagesArray as m}
  <Message {m} message={m} isOutgoing={m.address_from === userAddress} />
 {/each}
</div>
