import { get, writable } from 'svelte/store';
import Socket from '../../core/socket.js';
import Core from '../../core/core.js';
export const selectedConversation = writable(null);
export const conversationsArray = writable([]);
export const messagesArray = writable([]);

export function init() {
 Socket.events.addEventListener('new_message', event => eventNewMessage(event.detail));
 Socket.events.addEventListener('seen_message', event => eventSeenMessage(event.detail));
 if (Core.userAddress) {
  Socket.send('user_subscribe', { event: 'new_message' });
  Socket.send('user_subscribe', { event: 'seen_message' });
  listConversations();
 }
}

function listConversations() {
 Socket.send('user_list_conversations', null, true, (req, res) => resListConversations(res));
}

function resListConversations(res) {
 if (res.error === 0 && res.data?.conversations) conversationsArray.update(() => res.data.conversations);
}

export function listMessages(address) {
 messagesArray.update(() => []);//?
 Socket.send('user_list_messages', { address: address, count: 100, lastID: 0 }, true, resListMessages);
}

function resListMessages(req, res) {
 if (res.error === 0 && res.data?.messages)
 {
  messagesArray.set(
   res.data.messages.map(m => {
    // set some client-side attributes:
    m.received_by_my_homeserver = true
    return m;
   }));
  console.log(get(messagesArray))
 }
}

export function setMessageSeen(message) {
 console.log('setMessageSeen', message);
 Socket.send('user_message_seen', { messageID: message.id }, true, (req, res) =>
 {
  console.log('user_message_seen', res);
  if (res.error !== 0)
  {
   console.error(res)
   return;
  }
  message.seen = true;
 });
}

export function sendMessage(text) {

 let params = { address: get(selectedConversation).address, message: text };

 const msg = {
  address_from: Core.userAddress,
  address_to: params.address,
  message: params.message,
  created: new Date().toISOString().replace('T', ' ').replace('Z', '')
 };

 Socket.send('user_send_message', params, true, (req, res) =>
 {

  console.log('user_send_message', res);
  if (res.error !== 0) return;

  // update the message status and trigger the update of the messagesArray:
  msg.received_by_my_homeserver = true;
  messagesArray.update((v) => v);
 });

 messagesArray.update((v) => [msg, ...v]);
 updateConversationsArray(params.address, msg.created);
}

function updateConversationsArray(address_to, msg_created) {
 let ca = get(conversationsArray);
 const conversation = ca.find(c => c.address === address_to);
 console.log('updateConversationsArray', conversation, address_to, msg_created);

 if (conversation) {
  conversation.last_message_date = msg_created;
  const index = ca.indexOf(conversation);

  // shift the affected conversation to the top:
  ca.splice(index, 1);
  ca.unshift(conversation);

  conversationsArray.set(ca);
 }
}

export function openNewConversation(address) {
 // TODO: load visible name if it's already an existing conversation:
 selectedConversation.update(() => ({ address, visible_name: null }));
 Core.hideSidebarMobile.update(() => true);
 listMessages(address);
}

function eventNewMessage(res) {
 if (!res.data) return;
 if (Core.userAddress === res.data.from) return;
 const msg = res.data;
 msg.created = new Date().toISOString().replace('T', ' ').replace('Z', '');
 if (msg.address_from === get(selectedConversation)?.address) messagesArray.update(() => [msg, ...get(messagesArray)]);
 if (msg.address_from !== get(selectedConversation)?.address || !get(Core.isClientFocused)) showNotification(msg);
}

function eventSeenMessage(res) {
 console.log('eventSeenMessage', res);
 if (!res.data) return;
 const message_id = res.data.messageID;
 const message = get(messagesArray).find(m => m.id === message_id);
 if (message) {
  message.seen = res.data.seen;
  messagesArray.update((v) => v);
 }
}

function showNotification(msg) {
 playNotificationSound();
 // TODO: distinguish if it's a web or native version
 if (Notification.permission !== 'granted') return;
 const conversation = get(conversationsArray).find(c => c.address === msg.address_from);
 let notification;
 if (conversation) {
  notification = new Notification('New message from: ' + conversation.visible_name + ' (' + msg.address_from + ')', {
   body: msg.message,
   icon: 'img/photo.svg',
   silent: true
  });
 } else {
  notification = new Notification('New message from: ' + msg.address_from, {
   body: msg.message,
   icon: 'img/photo.svg',
   silent: true
  });
 }
 notification.onclick = () => {
  window.focus();
  selectedConversation.update(() => ({ address: msg.address_from, visible_name: conversation?.visible_name }));
  Core.hideSidebarMobile.update(() => true);
  listMessages(msg.address_from);
 };
}

function playNotificationSound() {
 const audio = new Audio('audio/message.mp3');
 audio.play();
}

export default {
 openNewConversation,
 listMessages,
 sendMessage,
 conversationsArray,
 messagesArray,
 selectedConversation,
 init
};
