<script>
 import { onMount } from 'svelte';
 import MenuBar from '../components/menu-bar.svelte';
 import ConversationList from '../components/conversations.svelte';
 import ProfileBar from '../components/profile-bar.svelte';
 import Chat from '../components/chat.svelte';
 import MessageBar from '../components/message-bar.svelte';
 import "../app.css";

 const requests = [];
 let conversations = [];
 let messages = [];
 let selectedConversation = null;
 let socket;
 const userAddress = 'user@example.com';
 const sessionID = '53ba3b0e-a834-421e-aba3-0851e13e7fa4';

 onMount(() => {
  socket = new WebSocket('wss://amtp.mediasun.cz');
  socket.onopen = () => {
   send('user_subscribe', { event: 'new_message' });
   send('user_list_conversations');
  };

  socket.onmessage = (event) => {
   const res = JSON.parse(event.data);
   //console.log('RESPONSE', res);
   if (res.requestID) {
    const req = requests[res.requestID];
    //console.log('REQUEST', req);
    if (req) {
     if (req.command) {
      switch (req.command) {
       case 'user_list_conversations':
        listConversations(res);
        break;
       case 'user_list_messages':
        listMessages(res);
        break;
      }
      if (req.event) {
       switch (req.event) {
        case 'new_message':
         addNewMessage(res);
         break;
       }
      }
     }
     delete requests[res.requestID];
    }
   }
  }
 });

 function listConversations(res) {
  if (res.error === 0 && res.data?.conversations) conversations = res.data.conversations;
 }

 function listMessages(res) {
  if (res.error === 0 && res.data?.messages) messages = res.data.messages;
 }

 function addNewMessage(res) {
  console.log(res);
 }

 function selectConversation(conversation) {
  selectedConversation = conversation;
  send('user_list_messages', {
   address: conversation.address,
   count: 100,
   offset: 0
  });
  requestAnimationFrame(() => {
   const input = document.querySelector('#message-bar input');
   if (input) input.focus();
  });
 }

 function sendMessage(text) {
  send('user_send_message', {
   address: selectedConversation.address,
   message: text
  });
 }

 function send(command = '', params = {}, sendSessionID = true) {
  const requestID = getRandomString();
  const req = { requestID };
  if (sendSessionID) req.sessionID = sessionID;
  req.command = command;
  req.params = params;
  requests[requestID] = req;
  socket.send(JSON.stringify(req));
 }

 function getRandomString(length = 40) {
  let result = '';
  while (result.length < length) result += Math.random().toString(36).substr(2);
  return result.substr(0, length);
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
  background: url('img/background.png') repeat;
  background-size: 400px;
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
