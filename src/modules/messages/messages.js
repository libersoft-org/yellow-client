import { get, writable } from 'svelte/store';
import Socket from '../../core/socket.js';
import Core from '../../core/core.js';
import DOMPurify from 'dompurify';

export const selectedConversation = writable(null);
export const conversationsArray = writable([]);
export const messagesArray = writable([]);

// only on client:
//if (typeof window !== 'undefined')
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
 if (node.tagName === 'A') {
  // Nastavení target na '_blank'
  node.setAttribute('target', '_blank');

  // Přidání rel atributu pro bezpečnost
  node.setAttribute('rel', 'noopener noreferrer');
 }
 if (node.tagName === 'VIDEO') {
  node.removeAttribute('autoplay');
 }
});

export function saneHtml(content) {
 return DOMPurify.sanitize(content);
}

export function init() {
 Socket.events.addEventListener('new_message', eventNewMessage);
 Socket.events.addEventListener('seen_message', eventSeenMessage);
 if (Core.userAddress) {
  Socket.send('user_subscribe', { event: 'new_message' });
  Socket.send('user_subscribe', { event: 'seen_message' });
  listConversations();
 }
}

export function uninit() {
 Socket.send('user_unsubscribe', { event: 'new_message' });
 Socket.send('user_unsubscribe', { event: 'seen_message' });
 Socket.events.removeEventListener('new_message', eventNewMessage);
 Socket.events.removeEventListener('seen_message', eventSeenMessage);
 messagesArray.set([]);
 conversationsArray.set([]);
 selectedConversation.set(null);
}

function listConversations() {
 Socket.send('user_list_conversations', null, true, (req, res) => resListConversations(res));
}

function resListConversations(res) {
 if (res.error === 0 && res.data?.conversations) conversationsArray.set(res.data.conversations.map(sanitizeConversation));
}

function sanitizeConversation(c) {
 c.last_message_text = stripHtml(c.last_message_text);
 return c;
}

export function listMessages(address) {
 messagesArray.set([]);
 Socket.send('user_list_messages', { address: address, count: 100, lastID: 0 }, true, resListMessages);
}

function resListMessages(req, res) {
 if (res.error === 0 && res.data?.messages) {
  messagesArray.set(
   res.data.messages.map(msg => {
    preprocessMessage(msg);
    return msg;
   })
  );
  console.log('resListMessages: messagesArray:');
  console.log(get(messagesArray));
 }
}

export function setMessageSeen(message, cb) {
 console.log('setMessageSeen', message);
 Socket.send('user_message_seen', { uid: message.uid }, true, (req, res) => {
  console.log('user_message_seen', res);
  if (res.error !== 0) {
   console.error(res);
   return;
  }
  message.seen = true;
  if (cb) cb();
  // update conversationsArray:
  const conversation = get(conversationsArray).find(c => c.address === message.address_from);
  if (conversation) {
   conversation.unread_count--;
   conversationsArray.update(v => v);
  }
 });
}

export function sendMessage(text) {
 const msg = {
  uid: Socket.getRandomString(),
  address_from: Core.userAddress,
  address_to: get(selectedConversation).address,
  message: text,
  stripped_text: stripHtml(text),
  created: new Date().toISOString().replace('T', ' ').replace('Z', '')
 };

 let params = { address: msg.address_to, message: msg.message, uid: msg.uid };

 Socket.send('user_send_message', params, true, (req, res) => {
  console.log('user_send_message', res);
  if (res.error !== 0) alert('Error while sending message: ' + res.message);
  else msg.received_by_my_homeserver = true;
  // update the message status and trigger the update of the messagesArray:
  messagesArray.update(v => v);
 });

 messagesArray.update(v => [msg, ...v]);
 updateConversationsArray(msg);
}

function remoteAddress(msg) {
 const address_to = msg.address_to;
 const address_from = msg.address_from;
 if (address_to === Core.userAddress) return address_from;
 else return address_to;
}

function isOutgoing(msg) {
 return msg.address_from === Core.userAddress;
}

function updateConversationsArray(msg) {
 const address_to = msg.address_to;
 const address_from = msg.address_from;
 const msg_created = msg.created;
 const msg_text = msg.message;
 let ca = get(conversationsArray);
 const conversation = ca.find(c => c.address === address_to || c.address === address_from);
 console.log('updateConversationsArray', conversation, address_to, msg_created);

 if (conversation) {
  conversation.last_message_date = msg_created;
  conversation.last_message_text = msg.stripped_text;
  const new_unread_count = isOutgoing(msg) ? 0 : 1;
  conversation.unread_count = conversation.unread_count ? conversation.unread_count + new_unread_count : new_unread_count;
  const index = ca.indexOf(conversation);

  // shift the affected conversation to the top:
  ca.splice(index, 1);
  ca.unshift(conversation);
 } else {
  let conversation = {
   address: remoteAddress(msg),
   last_message_date: msg_created,
   last_message_text: msg.stripped_text,
   visible_name: null,
   unread_count: isOutgoing(msg) ? 0 : 1
  };
  ca.unshift(conversation);
 }
 conversationsArray.set(ca);
}

export function openNewConversation(address) {
 console.log('openNewConversation', address);
 // TODO: load visible name if it's already an existing conversation:
 selectedConversation.update(() => ({ address, visible_name: null }));
 Core.hideSidebarMobile.update(() => true);
 listMessages(address);
}

function eventNewMessage(event) {
 const res = event.detail;
 if (!res.data) return;
 if (Core.userAddress === res.data.from) return;
 const msg = res.data;
 msg.created = new Date().toISOString().replace('T', ' ').replace('Z', '');
 preprocessMessage(msg);
 if (msg.address_from === get(selectedConversation)?.address) messagesArray.update(() => [msg, ...get(messagesArray)]);
 if (msg.address_from !== get(selectedConversation)?.address || !get(Core.isClientFocused)) showNotification(msg);
 updateConversationsArray(msg);
}

function stripHtml(html) {
 return html.replace(/<[^>]*>?/gm, '');
}

function preprocessMessage(msg) {
 msg.stripped_text = stripHtml(msg.message);
 msg.received_by_my_homeserver = true;
}

function eventSeenMessage(event) {
 const res = event.detail;
 console.log('eventSeenMessage', res);
 if (!res.data) return;
 console.log(get(messagesArray));
 const message = get(messagesArray).find(m => m.uid === res.data.uid);
 if (message) {
  message.seen = res.data.seen;
  messagesArray.update(v => v);
 } else console.error('eventSeenMessage: message not found by uid:', res);
}

function showNotification(msg) {
 playNotificationSound();
 // TODO: distinguish if it's a web or native version
 if (Notification.permission !== 'granted') return;
 const conversation = get(conversationsArray).find(c => c.address === msg.address_from);
 let notification;
 if (conversation) {
  notification = new Notification('New message from: ' + conversation.visible_name + ' (' + msg.address_from + ')', {
   body: msg.stripped_text,
   icon: 'img/photo.svg',
   silent: true
  });
 } else {
  notification = new Notification('New message from: ' + msg.address_from, {
   body: msg.stripped_text,
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

export function fetchConversationDetails(conversation, cb) {
 console.log('fetchConversationDetails', conversation);

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
