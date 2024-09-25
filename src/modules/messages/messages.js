import {derived, get, writable} from 'svelte/store';
import { md } from '../../core/core.js';
import DOMPurify from 'dompurify';



let module_data = md('messages');

export let selectedConversation = derived(module_data, ($module_data) => $module_data?.selected_conversation);
export let conversationsArray = derived(module_data, ($module_data) => $module_data?.conversations_array);
export let messagesArray = derived(module_data, ($module_data) => $module_data?.messages_array);




DOMPurify.addHook('afterSanitizeAttributes', function (node) {
 if (node.tagName === 'A') {
  node.setAttribute('target', '_blank');
  node.setAttribute('rel', 'noopener noreferrer');
 }
 if (node.tagName === 'VIDEO') {
  node.removeAttribute('autoplay');
 }
});

export function saneHtml(content) {
 return DOMPurify.sanitize(content);
}


export function initMessagesModuleData(acc) {
 return {
  id: 'messages',
  selectedConversation: writable(null),
  conversationsArray: writable([]),
  messagesArray: writable([]),
 };
}

export function initMessagesModuleComms(acc) {

 acc.socket.send('user_subscribe', { event: 'new_message' });
 acc.socket.send('user_subscribe', { event: 'seen_message' });

 let data = acc.module_data['messages'];

 data.new_message_listener = (event) => eventNewMessage(acc, event);
 data.seen_message_listener = (event) => eventSeenMessage(acc, event);

 acc.events.addEventListener('new_message', data.new_message_listener);
 acc.events.addEventListener('seen_message', data.seen_message_listener);

 listConversations(acc);

}

export function deinitMessagesModuleData(acc)
{
 acc.socket.send('user_unsubscribe', { event: 'new_message' });
 acc.socket.send('user_unsubscribe', { event: 'seen_message' });

 let data = acc.module_data['messages'];

 acc.events.removeEventListener('new_message', data.new_message_listener);
 acc.events.removeEventListener('seen_message', data.seen_message_listener);

 if (data) {
  data.messagesArray.set([]);
  data.conversationsArray.set([]);
  data.selectedConversation.set(null);
 }

 acc.module_data.messages = null;
}

function listConversations(acc) {
 send(acc, 'user_list_conversations', null, true, (_req, res) => {
  if (res.error === 0 && res.data?.conversations)
   conversationsArray.set(res.data.conversations.map(sanitizeConversation))
 });
}

function sanitizeConversation(c) {
 c.last_message_text = stripHtml(c.last_message_text);
 return c;
}

export function listMessages(acc, address) {
 messagesArray.set([]);
 send(acc, 'user_list_messages', { address: address, count: 100, lastID: 0 }, true, (_req, res) => {
  if (res.error === 0 && res.data?.messages) {
   messagesArray.set(
    res.data.messages.map(msg => {
     preprocessMessage(msg);
     return msg;
    })
   );
   console.log('resListMessages: messagesArray:');
   console.log(get(messagesArray));
  }});
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
 selectConversation({ address });
}

function eventNewMessage(acc, event) {
 const res = event.detail;
 if (!res.data) return;
 if (acc.credentials.address === res.data.from) return;
 const msg = res.data;
 msg.created = new Date().toISOString().replace('T', ' ').replace('Z', '');
 preprocessMessage(msg);
 let module_data = get(acc.module_data).messages
 let sc = get(selectedConversation);
 if (msg.address_from === sc?.address)
  messagesArray.update((v) => [msg, ...v]);
 if (msg.address_from !== sc?.address || !get(Core.isClientFocused))
  showNotification(acc, msg);
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

function showNotification(acc, msg) {
 if (!acc) console.error('showNotification: no account');
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
  selectConversation({ address: msg.address_from, visible_name: conversation?.visible_name });
 };
}

function playNotificationSound() {
 const audio = new Audio('audio/message.mp3');
 audio.play();
}

export function ensureConversationDetails(conversation, cb) {
 console.log('ensureConversationDetails', conversation);
 if (conversation.visible_name) return;
 Socket.send('user_get_userinfo', { address: conversation.address }, true, (_req, res) => {
  if (res.error !== 0) {
   console.error(res);
   return;
  }
  Object.assign(conversation, res.data);
  conversationsArray.update(v => v); // fixme: this infiloops?
 });
}

export default {
 ensureConversationDetails,
 openNewConversation,
 listMessages,
 sendMessage,
 conversationsArray,
 messagesArray,
 selectedConversation,
};
