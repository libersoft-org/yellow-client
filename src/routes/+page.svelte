<script>
 import { onMount } from 'svelte';
 import MenuBar from '../components/menu-bar.svelte';
 import ConversationList from '../components/conversations.svelte';
 import ProfileBar from '../components/profile-bar.svelte';
 import Chat from '../components/chat.svelte';
 import MessageBar from '../components/message-bar.svelte';
 import "../app.css";

 let conversations = [];
 let messages = [];
 let selectedConversation = null;
 let socket;
 const userAddress = 'user@example.com';
 const sessionID = '701e2615604563c675eabfc3d78e318919193af762c';

 onMount(() => {
  socket = new WebSocket('wss://amtp.mediasun.cz');
  socket.onopen = () => {
   socket.send(JSON.stringify({
    command: 'user_list_conversations',
    sessionID: sessionID
   }));
  };

  socket.onmessage = (event) => {
   const data = JSON.parse(event.data);
   console.log('onMessage', data);
   if (data.error === 0 && data.data) {
    if(data.data.conversations) {
    conversations = data.data.conversations.map(c => ({
     address: c.address,
     lastMessageDate: new Date(c.last_message_date.replace(' ', 'T') + 'Z').toLocaleString()
    }));
   };
   if (data.data.messages) {
    messages = data.data.messages.map(msg => ({
     from: msg.address_from,
     to: msg.address_to,
     text: msg.message,
     time: new Date(msg.created.replace(' ', 'T') + 'Z').toLocaleString()
    }));
   }
   }
  }
 });

 function selectConversation(conversation) {
  selectedConversation = conversation;
  socket.send(JSON.stringify({
   command: 'user_list_messages',
   sessionID: sessionID,
   params: {
    address: conversation.address,
    count: 100,
    offset: 0
   }
  }));
 }

 function sendMessage(text) {
  socket.send(JSON.stringify({
   command: 'user_send_message',
   sessionID: sessionID,
   params: {
    address: selectedConversation.address,
    message: text
   }
  }));
 }
</script>

<style>
 .app {
  display: flex;
  height: 100vh;
 }

 .sidebar {
  z-index: 100;
  width: 300px;
  border-right: 1px solid #ccc;
  box-shadow: var(--shadow);
 }

 .content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
 }
</style>

<div class="app">
 <div class="sidebar">
  <MenuBar />
  <ConversationList {conversations} onSelectConversation={selectConversation} />
 </div>
 <div class="content">
  {#if selectedConversation}
   <ProfileBar {selectedConversation} />
   <Chat {messages} {userAddress} />
   <MessageBar onSendMessage={sendMessage} />
  {/if}
 </div>
</div>
