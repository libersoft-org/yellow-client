import { writable } from 'svelte/store';
import Socket from '../../core/socket.js';
import Core from '../../core/core.js';
export const selectedConversation = writable(null);
export const conversationsArray = writable([]);
export const messagesArray = writable([]);

export function init() {
 console.log(Core);
 if (Core.userAddress) {
  Socket.send('user_subscribe', { event: 'new_message' });
  Socket.send('user_list_conversations', null, true, (req, res) => resListConversations(res));
 }
}

export function resListConversations(res) {
 console.log('LISTING CONVERSATIONS', res);
 if (res.error === 0 && res.data?.conversations) conversationsArray.update(() => res.data.conversations);
}

conversationsArray.subscribe(value => {
 console.log('SUBSCRIBE', value);
});

export function listMessages() {
 Socket.send('user_list_messages', { address: conversation.address }, true, resListMessages);
}

export function resListMessages(res) {
 console.log('LISTING MESSAGES', res);
 if (res.error === 0 && res.data?.messages) {
  messagesArray.update(() => res.data.messages);
  const contentDiv = document.createElement('div');
  new MessagesList({
   target: contentDiv,
   props: {
    messagesArray: messagesArray
   }
  });
  setContentHTML(contentDiv.innerHTML);
 }
}

function resSendMessage(req, res) {
 if (selectedConversation?.address === Core.userAddress) return;
 if (res.error !== 0) return;
 if (req?.params?.address !== selectedConversation.address) return;
 const msg = {
  address_from: Core.userAddress,
  address_to: req.params.address,
  message: req.params.message,
  created: new Date().toISOString().replace('T', ' ').replace('Z', '')
 };
 messagesArray.update(() => [msg, ...messagesArray]);
 Socket.send('user_list_conversations', null, true, (req, res) => resListConversations(res));
}

/* TODO: previous command switching
switch (req.command) {
 case 'user_list_conversations':
  //TODO: send to messages module
  //if (objMessages) objMessages.resListConversations(res);
  break;
 case 'user_list_messages':
  //TODO: send to messages module
  //if (objMessages) objMessages.resListMessages(res);
  break;
 case 'user_send_message':
  //TODO: send to messages module
  //resSendMessage(res, req);
 }
*/

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

//export default { selectedConversation, conversationsArray, messagesArray, init };
