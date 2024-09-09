import { get, writable } from 'svelte/store';
import Socket from '../../core/socket.js';
import Core from '../../core/core.js';
export const selectedConversation = writable(null);
export const conversationsArray = writable([]);
export const messagesArray = writable([]);

export function init() {
 if (Core.userAddress) {
  Socket.send('user_subscribe', { event: 'new_message' });
  listConversations();
 }
}

function listConversations() {
 Socket.send('user_list_conversations', null, true, (req, res) => resListConversations(res));
}

function resListConversations(res) {
 if (res.error === 0 && res.data?.conversations) conversationsArray.update(() => res.data.conversations);
}

// TODO: something old, delete when not needed:
//export function listMessages() {
// Socket.send('user_list_messages', { address: conversation.address }, true, resListMessages);
//}

export function listMessages(address) {
 messagesArray.update(() => []);
 Socket.send('user_list_messages', { address: address, count: 100, offset: 0 }, true, resListMessages);
}

function resListMessages(req, res) {
 if (res.error === 0 && res.data?.messages) messagesArray.update(() => res.data.messages);
}

export function sendMessage(text) {
 Socket.send('user_send_message', { address: get(selectedConversation).address, message: text }, true, resSendMessage);
}

function resSendMessage(req, res) {
 if (!get(selectedConversation)?.address) return;
 //if (get(selectedConversation).address === Core.userAddress) return;
 if (res.error !== 0) return;
 if (req?.params?.address !== get(selectedConversation).address) return;
 const msg = {
  address_from: Core.userAddress,
  address_to: req.params.address,
  message: req.params.message,
  created: new Date().toISOString().replace('T', ' ').replace('Z', '')
 };
 messagesArray.update(() => [msg, ...get(messagesArray)]);
 //TODO: replace with sorting just on client:
 listConversations();
}

export function openNewConversation(address) {
 // TODO: load visible name if it's already an existing conversation:
 selectedConversation.update(() => ({ address, visible_name: null }));
 listMessages(address);
}

/*
 function eventNewMessage(res) {
  if (!res.data) return;
  listConversations();
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
  // TODO: distinguish if it's a web or native version
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
*/

export default {
 openNewConversation,
 listMessages,
 sendMessage,
 conversationsArray,
 messagesArray,
 selectedConversation,
 init
};
