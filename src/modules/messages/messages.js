import {derived, get, writable} from 'svelte/store';
import {active_account, module_data_derived, registerModule, relay, isClientFocused } from '../../core/core.js';
import DOMPurify from 'dompurify';
import {send, getRandomString } from '../../core/core.js';
import { listConversations } from './conversations.js';


class Message {
 constructor(acc, data) {
  Object.assign(this, data);
  this.acc = new WeakRef(acc);
  this.stripped_text = stripHtml(this.message)
  this.is_outgoing = this.address_from === acc.credentials.address;
  if (this.address_to === acc.credentials.address)
   this.remote_address = this.address_from;
  else
   this.remote_address = this.address_to;
 }
}


export let md = module_data_derived('messages');

md.subscribe(v => {
    console.log('MD: ', v);
});

export let conversationsArray = relay(md, 'conversationsArray');
export let messagesArray = relay(md, 'messagesArray');
export let selectedConversation = relay(md, 'selectedConversation');

export function initData(acc) {
 let result = {
  id: 'messages',
  decl:{id:'messages', name:'Messages'},
  selectedConversation: writable(null),
  conversationsArray: writable([]),
  messagesArray: writable([]),
 };
 result.conversationsArray.subscribe(v => {
    console.log('acc conversationsArray:', acc, v);
 });
 return result;
}

export function initComms(acc) {

 send(acc, 'user_subscribe', { event: 'new_message' });
 send(acc, 'user_subscribe', { event: 'seen_message' });

 let data = acc.module_data['messages'];
 console.log('initComms:', data);

 data.new_message_listener = (event) => eventNewMessage(acc, event);
 data.seen_message_listener = (event) => eventSeenMessage(acc, event);

 acc.events.addEventListener('new_message', data.new_message_listener);
 acc.events.addEventListener('seen_message', data.seen_message_listener);

 listConversations(acc);
}

export function deinitData(acc)
{
 console.log('DEINIT DATA');

 send(acc, 'user_unsubscribe', { event: 'new_message' });
 send(acc, 'user_unsubscribe', { event: 'seen_message' });

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

registerModule('messages', {initData, initComms, deinitData});


export function listMessages(acc, address) {
 messagesArray.set([]);
 send(acc, 'user_list_messages', { address: address, count: 100, lastID: 0 }, true, (_req, res) => {
  if (res.error === 0 && res.data?.messages) {
   messagesArray.set(
    res.data.messages.map(msg => {
     let message = new Message(acc, msg);
     message.received_by_my_homeserver = true;
     return message;
    })
   );
   console.log('resListMessages: messagesArray:');
   console.log(get(messagesArray));
  }});
}

export function setMessageSeen(message, cb) {
 let acc = get(active_account);
 console.log('setMessageSeen', message);
 send(acc, 'user_message_seen', { uid: message.uid }, true, (req, res) => {
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

 let acc = get(active_account);

 let message = new Message(acc,{
  uid: getRandomString(),
  address_from: acc.credentials.address,
  address_to: get(selectedConversation).address,
  message: text,
  created: new Date().toISOString().replace('T', ' ').replace('Z', '')
 });

 let params = { address: message.address_to, message: message.message, uid: message.uid };

 send(acc, 'user_send_message', params, true, (req, res) => {
  console.log('user_send_message', res);
  if (res.error !== 0) alert('Error while sending message: ' + res.message);
  else message.received_by_my_homeserver = true;
  // update the message status and trigger the update of the messagesArray:
  messagesArray.update(v => v);
 });

 messagesArray.update(v => [message, ...v]);
 updateConversationsArray(message);
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
  const new_unread_count = msg.is_outgoing ? 0 : 1;
  conversation.unread_count = conversation.unread_count ? conversation.unread_count + new_unread_count : new_unread_count;
  const index = ca.indexOf(conversation);

  // shift the affected conversation to the top:
  ca.splice(index, 1);
  ca.unshift(conversation);
 } else {
  let conversation = {
   address: msg.remote_address,
   last_message_date: msg_created,
   last_message_text: msg.stripped_text,
   visible_name: null,
   unread_count: msg.is_outgoing ? 0 : 1
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
 const msg = new Message(acc, res.data);
 msg.created = new Date().toISOString().replace('T', ' ').replace('Z', '');
 msg.received_by_my_homeserver = true;
 let sc = get(selectedConversation);
 if (msg.address_from === sc?.address)
  messagesArray.update((v) => [msg, ...v]);
 if (msg.address_from !== sc?.address || !get(isClientFocused))
  showNotification(acc, msg);
 updateConversationsArray(msg);
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
 let acc = get(active_account);
 send(acc, 'user_get_userinfo', { address: conversation.address }, true, (_req, res) => {
  if (res.error !== 0) {
   console.error(res);
   return;
  }
  Object.assign(conversation, res.data);
  conversationsArray.update(v => v); // fixme: this infiloops?
 });
}


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

export function stripHtml(html) {
 return html.replace(/<[^>]*>?/gm, '');
}

export default {
 ensureConversationDetails,
 openNewConversation,
 listMessages,
 sendMessage,

};
