<script>
 import { onDestroy, onMount, tick } from 'svelte';
 import Core from '../../../core/core.js';
 import { debug } from '../../../core/core.js';
 import { get } from 'svelte/store';
 import { selectedConversation } from '../messages.js';
 import ProfileBar from './profile-bar.svelte';
 import MessagesList from './messages-list.svelte';
 import MessageBar from './message-bar.svelte';

 let message_bar;

 $: update($selectedConversation);

 async function update(selectedConversation) {
  if (selectedConversation) {
   await setBarFocus();
  }
 }

 onMount(async () => {
  console.log('conversation mounted for:', get(selectedConversation));
  window.addEventListener('keydown', onkeydown);
 });

 onDestroy(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onkeydown);
 });

 function closeConversation() {
  selectedConversation.update(() => null);
  Core.hideSidebarMobile.update(() => false);
 }

 export async function setBarFocus() {
  await tick();
  await message_bar?.setBarFocus();
 }

 async function onkeydown(event) {
  console.log('Conversation keyDown: ', event.key);
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

<div tabindex="0" class="conversation" {onkeydown}>
 <ProfileBar {closeConversation} />
 <MessagesList {message_bar} {setBarFocus} conversation={$selectedConversation} />
 <MessageBar bind:this={message_bar} />
</div>
