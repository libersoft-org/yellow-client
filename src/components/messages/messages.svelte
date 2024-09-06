<script>
 import { onMount, onDestroy } from 'svelte';
 import Socket from '../../scripts/socket';
 import Auth from '../../scripts/auth';
 import ConversationsList from './conversations-list.svelte';
 import Conversation from './conversation.svelte';
 export let setSidebarHTML;
 export let setContentHTML;
 let selectedConversation = null;
 let conversationsArray = [];
 let messagesArray = [];
 //let isClientFocused = true;

 onMount(() => {
  window.addEventListener('keydown', hotKeys);
  //window.addEventListener('focus', () => isClientFocused = true);
  //window.addEventListener('blur', () => isClientFocused = false);
 });

 onDestroy(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', hotKeys);
 });

 export function init() {
  if (Auth.userAddress) {
   Socket.send('user_subscribe', { event: 'new_message' });
   Socket.send('user_list_conversations', null, true, (req, res) => resListConversations(res));
  }
 }
/*
 export function setSidebarHTML(html) {
  dispatch('updateSidebar', { html });
 }

 export function setContentHTML(html) {
  dispatch('updateContent', { html });
 }
*/
 export function resListConversations(res) {
  console.log('LISTING CONVERSATIONS', res);
  if (res.error === 0 && res.data?.conversations) {
   conversationsArray = res.data.conversations;
   const sidebarDiv = document.createElement('div');
   new ConversationsList({
    target: sidebarDiv,
    props: {
     conversationsArray: conversationsArray,
     onSelectConversation: (conversation) => {
      selectedConversation = conversation;
      setContentHTML('Loading messages');
      console.log('klik na konverzaci');
      Socket.send('user_list_messages', { address: conversation.address }, true, resListMessages);
     }
    }
   });
   setSidebarHTML(sidebarDiv.innerHTML);
  }
 }

 export function resListMessages(res) {
  console.log('LISTING MESSAGES', res);
  if (res.error === 0 && res.data?.messages) {
   messagesArray = res.data.messages;
   const contentDiv = document.createElement('div');
   new MessagesList({
    target: contentDiv,
    props: {
     messagesArray: messagesArray,
     
    }
   });
   setContentHTML(contentDiv.innerHTML);
  }
 }

 function resSendMessage(req, res) {
  if (selectedConversation?.address === Auth.userAddress) return;
  if (res.error !== 0) return;
  if (req?.params?.address !== selectedConversation.address) return;
  const msg = {
   address_from: Auth.userAddress,
   address_to: req.params.address,
   message: req.params.message,
   created: new Date().toISOString().replace('T', ' ').replace('Z', '')
  };
  messagesArray = [msg, ...messagesArray];
  Socket.send('user_list_conversations', null, true, (req, res) => resListConversations(res));
 }
/*
 function eventNewMessage(res) {
  if (!res.data) return;
  send('user_list_conversations');
  const msg = {
   address_from: res.data.from,
   address_to: res.data.to,
   message: res.data.message,
   created: new Date().toISOString().replace('T', ' ').replace('Z', '')
  }
  if (msg.address_from === selectedConversation?.address) messagesArray = [msg, ...messagesArray];
  if (msg.address_from !== selectedConversation?.address || !isClientFocused) {
   showNotification(msg);
   playNotificationSound();
  }
 }

 function showNotification(msg) {
  if (Notification.permission !== 'granted') return;
  const conversation = conversationsArray.find(c => c.address === msg.address_from);
  const notification = new Notification('New message from: ' + conversation.visible_name + ' (' + msg.address_from + ')', {
   body: msg.message,
   icon: 'img/photo.svg',
   silent: true
  });
  notification.onclick = () => {
   window.focus();
   selectConversation({ address: msg.address_from, visible_name: conversation.visible_name });
  };
 }

 function playNotificationSound() {
  const audio = new Audio('audio/message.mp3');
  audio.play();
 }

 function openNewConversation(address) {
  selectConversation({ address });
 }

 function selectConversation(conversation) {
  selectedConversation = conversation;
  messagesArray = [];
  send('user_list_messages', {
   address: conversation.address,
   count: 100,
   offset: 0
  });
  requestAnimationFrame(() => {
   const input = document.querySelector('.message-bar .message');
   if (input) input.focus();
  });
 }

 function sendMessage(text) {
  send('user_send_message', {
   address: selectedConversation.address,
   message: text
  });
 }
 */
 function hotKeys(event) {
  if (event.key === 'Escape' && selectedConversation) selectedConversation = null;
 }
</script>

<svelte:options accessors={true} />
