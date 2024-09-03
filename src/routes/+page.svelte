<script>
 import { onMount, onDestroy } from 'svelte';
 import Login from '../components/login.svelte';
 import MenuBar from '../components/menu-bar.svelte';
 import Menu from '../components/menu.svelte';
 import ConversationList from '../components/conversations.svelte';
 import Welcome from '../components/welcome.svelte';
 import ProfileBar from '../components/profile-bar.svelte';
 import Messages from '../components/messages.svelte';
 import MessageBar from '../components/message-bar.svelte';
 import "../app.css";

 const requests = [];
 let product = 'Yellow';
 let version = '0.01';
 let loginError;
 let conversationsArray = [];
 let socket;
 let server;
 let userAddress;
 let sessionID;
 let messagesArray = [];
 let selectedConversation = null;
 let isLoggingIn = false;
 let isClientFocused = true;
 let isMenuOpen = false;

 onMount(() => {
  server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/';
  window.addEventListener('keydown', hotKeys);
  window.addEventListener('focus', () => isClientFocused = true);
  window.addEventListener('blur', () => isClientFocused = false);
 });

 onDestroy(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', hotKeys);
 });

 function toggleMenu() {
  isMenuOpen = !isMenuOpen;
 }

 function closeMenu() {
  isMenuOpen = false;
 }

 function login(credentials) {
  isLoggingIn = true;
  socket = new WebSocket(credentials.server);
  socket.onopen = () => send('user_login', { address: credentials.address, password: credentials.password }, false);
  socket.onerror = (event) => {
   isLoggingIn = false;
   const error = 'Unable to connect to server. Please check the server address.';
   if (!userAddress) loginError = { message: error };
   else alert('Error: ' + error);
  }
  socket.onclose = () => {
   if (userAddress) alert('Lost connection with server.');
  }
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
   icon: 'img/background.png',
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

<svelte:head>
 <title>{product}</title>
</svelte:head>

<div class="app">
 {#if userAddress}
 <div class="sidebar">
  <MenuBar {toggleMenu} />
  <Menu {isMenuOpen} {product} {version} onClose={closeMenu} />
  <ConversationList {conversationsArray} onSelectConversation={selectConversation} />
 </div>
 <div class="content">
  {#if selectedConversation}
   <ProfileBar {selectedConversation} onClose={() => selectedConversation = null} />
   <Messages {messagesArray} {userAddress} />
   <MessageBar onSendMessage={sendMessage} />
  {:else}
   <Welcome {product} {version} />
  {/if}
 </div>
 {:else}
  <Login onLogin={login} error={loginError} {isLoggingIn} {server} {product} {version} />
 {/if}
</div>
