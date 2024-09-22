<script>
 import { setMessageSeen } from '../messages.js';

 import {onDestroy, onMount} from "svelte";


 export let message;
 export let isOutgoing;
 export let container_element;


 let seen_txt;
 let checkmarks;

 let observer;
 let element;


 $: checkmarks = message.seen ? '2' : message.received_by_my_homeserver ? '1' : '0';
 $: seen_txt = message.seen ? 'Seen' : message.received_by_my_homeserver ? 'Sent' : 'Sending';

 function processMessage(content) {
  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  return containsHtml ? content : linkify(content).replaceAll(' ', '&nbsp;').replaceAll("\n", '<br />');
 }

 function linkify(text) {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
 }

 onMount(() => {
  if (!message.seen && !isOutgoing)
  {
   observer = new IntersectionObserver((entries) => {
    console.log(entries)
    const IsVisible = entries[0].isIntersecting;
    if (!IsVisible)
    {
     console.log('not setting seen because !IsVisible');
     return;
    }
    if (message.seen) {
     console.log('not setting seen because already set');
     observer.disconnect();
     return;
    }
    setMessageSeen(message, () => {
     console.log('seen set succesfully, disconnecting observer.')
     observer.disconnect();
    })
    }, { threshold: 0.8, root: container_element }
   );
   observer.observe(element);
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

 .message .time {
  font-size: 12px;
  text-align: right;
 }
</style>

<div bind:this={element} class="message {isOutgoing ? 'outgoing' : 'incoming'}">
 <div class="text">{@html processMessage(message.message)}</div>
 <div class="time">{new Date(message.created.replace(' ', 'T') + 'Z').toLocaleString()}</div>
 {#if isOutgoing}
  <img src="img/seen{checkmarks}.svg" alt="{seen_txt}" />
 {/if}
</div>
