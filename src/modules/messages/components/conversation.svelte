<script>
 import { userAddress } from '../../../core/core.js';
 import { onMount, onDestroy } from 'svelte';
 import ProfileBar from './profile-bar.svelte';
 import MessagesList from './messages-list.svelte';
 import MessageBar from './message-bar.svelte';
 export let selectedConversation;
 export let messagesArray;
 export let sendMessage;
 //let isClientFocused = true;

 onMount(() => {
  console.log('MOJE ADRESA', userAddress);
  window.addEventListener('keydown', hotKeys);
  //window.addEventListener('focus', () => isClientFocused = true);
  //window.addEventListener('blur', () => isClientFocused = false);
 });

 onDestroy(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', hotKeys);
 });

 function hotKeys(event) {
  if (event.key === 'Escape' && selectedConversation) selectedConversation = null;
 }
</script>

<style>
 .conversation {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: url('img/background.webp') repeat;
  background-size: 400px;
 }
</style>

<div class="conversation">
 <ProfileBar {selectedConversation} onClose={() => selectedConversation = null} />
 <MessagesList {messagesArray} {userAddress} />
 <MessageBar onSendMessage={sendMessage} />
</div>
