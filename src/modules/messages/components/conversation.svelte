<script>
 import { onDestroy, onMount } from 'svelte';
 import Core from '../../../core/core.js';
 import { get } from 'svelte/store';
 import { selectedConversation } from '../messages.js';
 import ProfileBar from './profile-bar.svelte';
 import MessagesList from './messages-list.svelte';
 import MessageBar from './message-bar.svelte';

 let message_bar;
// $: message_bar?.setBarFocus();

/* onMount(() => {
  console.log('conversation mounted for:', get(selectedConversation));
  window.addEventListener('keydown', hotKeys);
 });

 onDestroy(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', hotKeys);
 });
*/
 function closeConversation() {
  selectedConversation.update(() => null);
  Core.hideSidebarMobile.update(() => false);
 }

 /*function hotKeys(event) {
  if (event.key === 'Escape' && get(selectedConversation)) closeConversation();
 }*/

 async function onkeydown(event) {
  console.log('Conversation keyDown: ', event.key);
  if (event.key === 'Escape' && get(selectedConversation)) {
   closeConversation();
   return;
  }
  //if (event.key === 'a')
  {
   event.preventDefault();
   await message_bar.setBarFocus();
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

<div class="conversation" {onkeydown}>
 <ProfileBar {closeConversation} />
 <MessagesList {message_bar} conversation={$selectedConversation} />
 <MessageBar bind:this={message_bar} />
</div>
