<script>
 import { afterUpdate } from 'svelte';
 export let messages = [];
 export let userAddress;
 let chat;

 afterUpdate(() => { scrollToBottom(); });

 function scrollToBottom() {
  if (chat) chat.scrollTop = chat.scrollHeight;
 }
</script>

<style>
 #chat {
  display: flex;
  flex-direction: column-reverse;
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
  background: url('img/background.png') repeat;
  background-size: 400px;
 }

 .message {
  max-width: 60%;
  padding: 10px;
  margin: 10px 0;
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
 }

 .message .time {
  font-size: 12px;
  text-align: right;
 }
</style>

<div bind:this={chat} id="chat">
 {#each messages as message}
  <div class="message {message.from === userAddress ? 'outgoing' : 'incoming'}">
   <div class="bold">{message.from}</div>
   <div class="text">{message.text}</div>
   <div class="time">{message.time}</div>
  </div>
 {/each}
</div>
