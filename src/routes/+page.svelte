<script>
 import { onMount, onDestroy } from 'svelte';
 import Login from '../components/login.svelte';
 import MenuBar from '../components/menu-bar.svelte';
 import ConversationList from '../components/conversations.svelte';
 import Welcome from '../components/welcome.svelte';
 import ProfileBar from '../components/profile-bar.svelte';
 import Messages from '../components/messages.svelte';
 import MessageBar from '../components/message-bar.svelte';
 import "../app.css";

 const requests = [];
 let loginError;
 let conversationsArray = [];
 let socket;
 let server;
 let userAddress;
 let sessionID;
 let messagesArray = [];
 let selectedConversation = null;
 let isLoggingIn = false;

 onMount(() => window.addEventListener('keydown', hotKeys));
 onDestroy(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', hotKeys);
 });

 function login(credentials) {
  isLoggingIn = true;
  //console.log('LOGGING IN', credentials);
  socket = new WebSocket(credentials.server);
  socket.onopen = () => send('user_login', { address: credentials.address, password: credentials.password }, false);
  socket.onerror = (event) => {
   console.log(event);
   isLoggingIn = false;
   const error = 'Unable to connect to server. Please check the server address.';
   if (!userAddress) loginError = { message: error };
   else alert('Error: ' + error);
  }
  socket.onclose = () => alert('Lost connection with server.');
  socket.onmessage = (event) => {
   const res = JSON.parse(event.data);
   //console.log('RESPONSE', res);
   if (res.requestID) {
    const req = requests[res.requestID];
    //console.log('REQUEST', req);
    if (req) {
     if (req.command) {
      switch (req.command) {
       case 'user_login':
        resLogin(res, req);
       case 'user_list_conversations':
        resListConversations(res);
        break;
       case 'user_list_messages':
        resListMessages(res);
        break;
       case 'user_send_message':
        resSendMessage(res, req);
      }
     }
     delete requests[res.requestID];
    }
   }
   if (res.event) {
    switch (res.event) {
     case 'new_message':
      eventNewMessage(res);
      break;
    }
   }
  };
 }

 function resLogin(res, req) {
  if (res.error !== 0) {
   loginError = res;
   isLoggingIn = false;
   return;
  }
  userAddress = req.params.address;
  sessionID = res.data.sessionID;
  loginError = null;
  send('user_subscribe', { event: 'new_message' });
  send('user_list_conversations');
 }

 function resListConversations(res) {
  if (res.error === 0 && res.data?.conversations) conversationsArray = res.data.conversations;
 }

 function resListMessages(res) {
  if (res.error === 0 && res.data?.messages) messagesArray = res.data.messages;
 }

 function resSendMessage(res, req) {
  if (selectedConversation?.address === userAddress) return;
  if (res.error !== 0) return;
  if (req?.params?.address !== selectedConversation.address) return;
  const msg = {
   address_from: userAddress,
   address_to: req.params.address,
   message: req.params.message,
   created: new Date().toISOString().replace('T', ' ').replace('Z', '')
  };
  messagesArray = [msg, ...messagesArray];
  send('user_list_conversations');
 }

 function eventNewMessage(res) {
  if (!res.data) return;
  if (res.data.from !== selectedConversation?.address) return;
  const msg = {
   address_from: res.data.from,
   address_to: res.data.to,
   message: res.data.message,
   created: new Date().toISOString().replace('T', ' ').replace('Z', '')
  }
  messagesArray = [msg, ...messagesArray];
  send('user_list_conversations');
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

 function hotKeys(event) {
  if (event.key === 'Escape' && selectedConversation) {
   selectedConversation = null;
  }
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
 {#if userAddress}
 <div class="sidebar">
  <MenuBar />
  <ConversationList {conversationsArray} onSelectConversation={selectConversation} />
 </div>
 <div class="content">
  {#if selectedConversation}
   <ProfileBar {selectedConversation} onClose={() => selectedConversation = null} />
   <Messages {messagesArray} {userAddress} />
   <MessageBar onSendMessage={sendMessage} />
  {:else}
   <Welcome />
  {/if}
 </div>
 {:else}
  <Login onLogin={login} error={loginError} {isLoggingIn} />
 {/if}
</div>
