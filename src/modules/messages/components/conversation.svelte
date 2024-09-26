<script>
 import { onMount, onDestroy } from 'svelte';
 import Core from '../../../core/core.js';
 import { get } from 'svelte/store';
 import { selectedConversation } from '../messages.js';
 import ProfileBar from './profile-bar.svelte';
 import MessagesList from './messages-list.svelte';
 import MessageBar from './message-bar.svelte';


 let message_bar;
 $: message_bar?.setBarFocus($selectedConversation)

 onMount(() => {
  console.log('conversation mounted for:', get(selectedConversation));
  window.addEventListener('keydown', hotKeys);
 });

 onDestroy(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', hotKeys);
 });

 function closeConversation() {
  selectedConversation.update(() => null);
  Core.hideSidebarMobile.update(() => false);
 }

 function hotKeys(event) {
  if (event.key === 'Escape' && get(selectedConversation)) closeConversation();
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

<div class="conversation">
 <ProfileBar {closeConversation} />
 <MessagesList on:mousedown={() => {console.log('MessagesList on:mousedown'); message_bar?.setBarFocus()}} />
 <MessageBar bind:this={message_bar}/>
</div>
