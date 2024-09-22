<script>
 import { afterUpdate, beforeUpdate } from 'svelte';
 import Core from '../../../core/core.js';
 import { messagesArray } from '../messages.js';
 import Message from './message.svelte';
 import {get} from "svelte/store";

 let messages_elem;
 let isScrolledToBottom;
 let wasScrolledToBottom = true;

 beforeUpdate(() => {
     if (messages_elem)
        wasScrolledToBottom = messages_elem.scrollTop + messages_elem.clientHeight >= messages_elem.scrollHeight - 1;
 });

 afterUpdate(() => {
     if (wasScrolledToBottom)
       scrollToBottom()
 });

 function scrollToBottom() {
   if (messages_elem)
     messages_elem.scrollTop = messages_elem.scrollHeight;
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

  <Message message={m} isOutgoing={m.address_from === Core.userAddress} container_element="{messages_elem}" />
 {/each}
</div>
