<script>
 import { onDestroy, onMount, setContext, tick } from 'svelte';
 import Core from '../../../core/core.js';
 import { get } from 'svelte/store';
 import { selectedConversation } from '../messages.js';
 import ProfileBar from './profile-bar.svelte';
 import MessagesList from './messages-list.svelte';
 import MessageBar from './message-bar.svelte';
 let message_bar;
 let oldSelectedConversation;
 let messagesContext = {};
 setContext('MessagesContext', messagesContext);

 $: messagesContext.messageBar = message_bar;
 $: update($selectedConversation);

 async function update(selectedConversation) {
  if (selectedConversation) {
   if (oldSelectedConversation != selectedConversation) {
    oldSelectedConversation = selectedConversation;
    await setBarFocus();
   }
  }
 }

 onMount(async () => {
  console.log('conversation mounted for:', get(selectedConversation));
  window.addEventListener('keydown', onKeydown);
 });

 onDestroy(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown);
 });

 function closeConversation() {
  selectedConversation.set(null);
  Core.hideSidebarMobile.set(false);
 }

 export async function setBarFocus() {
  await tick();
  await message_bar?.setBarFocus();
 }

 async function onKeydown(event) {
  //console.log('Conversation keyDown: ', event.key);
  if (event.key === 'Escape' && get(selectedConversation)) {
   closeConversation();
   return;
  }
 }
</script>

<style>
 .conversation {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }
</style>

<div role="none" class="conversation" onkeydown={onKeydown}>
 <ProfileBar {closeConversation} />
 <MessagesList {setBarFocus} conversation={$selectedConversation} />
 <MessageBar bind:this={message_bar} />
</div>
