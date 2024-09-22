<script>
    import {afterUpdate, beforeUpdate, onMount} from 'svelte';
 import Core from '../../../core/core.js';
 import { messagesArray } from '../messages.js';
 import Message from './message.svelte';
 import {get} from "svelte/store";

 let messages_elem;
 let isScrolledToBottom;
 let wasScrolledToBottom = true;

 function updateWasScrolledToBottom()
 {
     if (messages_elem)
     {
         wasScrolledToBottom = messages_elem.scrollTop > -1;
     /*console.log('beforeUpdate: wasScrolledToBottom:', wasScrolledToBottom);
     console.log('beforeUpdate: -messages_elem.scrollTop + messages_elem.clientHeight:', -messages_elem.scrollTop + messages_elem.clientHeight);
     console.log('beforeUpdate: messages_elem.scrollTop:', messages_elem.scrollTop);
     console.log('beforeUpdate: messages_elem.clientHeight:', messages_elem.clientHeight);
     console.log('beforeUpdate: messages_elem.scrollHeight:', messages_elem.scrollHeight);*/
    }

 }

 beforeUpdate(() => {
        updateWasScrolledToBottom();
 });

 afterUpdate(() => {
     console.log('afterUpdate: wasScrolledToBottom:', wasScrolledToBottom);
     if (wasScrolledToBottom)
       scrollToBottom()
 });

 onMount(() => {
   /*setInterval(() => {
     updateWasScrolledToBottom();
   }, 1000);*/
 });

 function scrollToBottom() {
     /*todo: fixme: sometimes does not scroll to bottom properly when two messages appear at once*/
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
