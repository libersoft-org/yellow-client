import { get, writable } from 'svelte/store';
import { active_account, active_account_id, getGuid, hideSidebarMobile, isClientFocused, active_account_module_data, relay, send } from '../../core/core.js';
import DOMPurify from 'dompurify';
import { module } from './module.js';

class Message {
 constructor(acc, data) {
  Object.assign(this, data);
  this.acc = new WeakRef(acc);
  this.stripped_text = stripHtml(this.message);
  console.log('Message address_from: ' + this.address_from + ' acc:' + acc.credentials.address);
  this.is_outgoing = this.address_from === acc.credentials.address;
  if (this.address_to === acc.credentials.address) this.remote_address = this.address_from;
  else this.remote_address = this.address_to;
 }
}

export let md = active_account_module_data(module.identifier);
export let conversationsArray = relay(md, 'conversationsArray');
export let messagesArray = relay(md, 'messagesArray');
export let selectedConversation = relay(md, 'selectedConversation');

export function initData(acc) {
 let result = {
  selectedConversation: writable(null),
  conversationsArray: writable([]),
  messagesArray: writable([]),
 };
 result.conversationsArray.subscribe(v => {
  console.log('acc conversationsArray:', acc, v);
 });
 return result;
}

active_account_id.subscribe(acc => {
 get(md)?.['selectedConversation']?.set(null);
});

function sendData(acc, command, params = {}, sendSessionID = true, callback = null, quiet = false) {
 send(acc, module.identifier, command, params, sendSessionID, callback, quiet);
}

export function selectConversation(conversation) {
 selectedConversation.update(() => conversation);
 hideSidebarMobile.update(() => true);
 messagesArray.set([]);
 console.log('selectConversation', conversation);
 listMessages(conversation.acc, conversation.address);
}

export function listConversations(acc) {
 sendData(acc, 'conversations_list', null, true, (_req, res) => {
  if (res.error !== 0) {
   console.error('this is bad.');
   return;
  }
  if (res.data?.conversations) {
   let conversationsArray = acc.module_data[module.identifier].conversationsArray;
   console.log('listConversations into:', conversationsArray);
   conversationsArray.set(res.data.conversations.map(c => sanitizeConversation(acc, c)));
  }
 });
}

function sanitizeConversation(acc, c) {
 c.acc = acc;
 c.last_message_text = stripHtml(c.last_message_text);
 return c;
}

function moduleEventSubscribe(acc, event_name) {
 sendData(acc, 'subscribe', { event: event_name }, true, (req, res) => {
  if (res.error !== 0) {
   console.error('this is bad.');
   window.alert('Communication with server Error while subscribing to event: ' + res.message);
  }
 });
}

export function initComms(acc) {
 moduleEventSubscribe(acc, 'new_message');
 moduleEventSubscribe(acc, 'seen_message');
 moduleEventSubscribe(acc, 'seen_inbox_message');

 let data = acc.module_data[module.identifier];
 console.log('initComms:', data);

 data.new_message_listener = event => eventNewMessage(acc, event);
 data.seen_message_listener = event => eventSeenMessage(acc, event);
 data.seen_inbox_message_listener = event => eventSeenInboxMessage(acc, event);

 acc.events.addEventListener('new_message', data.new_message_listener);
 acc.events.addEventListener('seen_message', data.seen_message_listener);
 acc.events.addEventListener('seen_inbox_message', data.seen_inbox_message_listener);

 listConversations(acc);
}

export function deinitComms(acc) {
 sendData(acc, 'user_unsubscribe', { event: 'new_message' });
 sendData(acc, 'user_unsubscribe', { event: 'seen_message' });
 sendData(acc, 'user_unsubscribe', { event: 'seen_inbox_message' });
}

export function deinitData(acc) {
 console.log('DEINIT DATA');

 let data = acc.module_data[module.identifier];
 if (!data) return;

 acc.events.removeEventListener('new_message', data.new_message_listener);
 acc.events.removeEventListener('seen_message', data.seen_message_listener);
 acc.events.removeEventListener('seen_inbox_message', data.seen_message_listener);

 data.messagesArray.set([]);
 data.conversationsArray.set([]);
 data.selectedConversation.set(null);

 acc.module_data[module.identifier] = null;
}

export function listMessages(acc, address) {
 messagesArray.set([{ type: 'initial_loading_placeholder' }]);
 console.log('listMessages', acc, address);
 loadMessages(acc, address);
}

export function loadMessages(acc, address, base = 'unseen', prev = 3, next = 3) {
 sendData(acc, 'messages_list', { address: address, base, prev, next }, true, (_req, res) => {
  if (res.error !== 0 || !res.data?.messages) {
   console.error(res);
   window.alert('Error while listing messages: ' + (res.message || JSON.stringify(res)));
   return;
  }
  addLoadedMessagesToMessagesArray(acc, res.data.messages);
 });
}

function addLoadedMessagesToMessagesArray(acc, items) {
 items = constructLoadedMessages(acc, items);
 addMessagesToMessagesArray(items);
}

function addMessagesToMessagesArray(items) {
 let arr = get(messagesArray);
 arr = arr.filter(m => m.type !== 'initial_loading_placeholder');
 for (let m of items) {
  addMessage(arr, m);
 }
 sortMessages(arr);
 addMissingPrevNext(arr);
 messagesArray.set(arr);
}

function addMessage(arr, msg) {
 let m = arr.find(m => m.uid === msg.uid);
 if (m) {
  for (let key in msg) m[key] = msg[key];
 } else {
  arr.unshift(msg);
 }
}

function constructLoadedMessages(acc, data) {
 let items = data.map(msg => {
  let message = new Message(acc, msg);
  message.received_by_my_homeserver = true;
  return message;
 });
 return items;
}

function sortMessages(messages) {
 messages.sort((a, b) => {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
 });
}

function addMissingPrevNext(messages) {
 for (let i = 0; i < messages.length; i++) {
  let m = messages[i];
  if (m.prev === undefined)
   m.prev = findPrev(messages, i);
  if (m.next === undefined) {
   m.next = findNext(messages, i);
  } else if (m.next === 'none') {
   let next = findNext(messages, i);
   if (next !== undefined) {
    m.next = next;
   }
  }
 }
}

 function findPrev(messages, i) {
  for (const m of messages) {
   if (m.next === i.id) return m.id;
  }
 }

 function findNext(messages, i) {
  for (const m of messages) {
   if (m.prev === i.id) return m.id;
  }
 }

 export function setMessageSeen(message, cb) {
  let acc = get(active_account);
  console.log('setMessageSeen', message);
  sendData(acc, 'message_seen', { uid: message.uid }, true, (req, res) => {
   if (res.error !== 0) {
    console.error('this is bad.');
    return;
   }
   //message.seen = true;
   if (cb) cb();
   //messagesArray.update(v => v);
   // update conversationsArray:
   /*const conversation = get(conversationsArray).find(c => c.address === message.address_from);
   if (conversation) {
    conversation.unread_count--;
    conversationsArray.update(v => v);
   }*/
  });
 }

 export function sendMessage(text) {
  let acc = get(active_account);

  let message = new Message(acc, {
   uid: getGuid(),
   address_from: acc.credentials.address,
   address_to: get(selectedConversation).address,
   message: text,
   created: new Date().toISOString().replace('T', ' ').replace('Z', ''),
  });

  let params = { address: message.address_to, message: message.message, uid: message.uid };

  sendData(acc, 'message_send', params, true, (req, res) => {
   if (res.error !== 0) {
    alert('Error while sending message: ' + res.message);
    return;
   }
   // update the message status and trigger the update of the messagesArray:
   message.received_by_my_homeserver = true;
   messagesArray.update(v => v);
  });

  addMessagesToMessagesArray([message]);
  updateConversationsArray(acc, message);
 }


 function updateConversationsArray(acc, msg) {
  const msg_created = msg.created;
  let acc_ca = acc.module_data[module.identifier].conversationsArray;
  let ca = get(acc_ca);
  const conversation = ca.find(c => c.address === msg.remote_address);
  console.log('updateConversationsArray', conversation, msg_created);

  if (conversation) {
   conversation.last_message_date = msg_created;
   conversation.last_message_text = msg.stripped_text;
   if (!msg.seen && msg.from_address != msg.acc.deref()?.credentials.address) {
    const new_unread_count = msg.is_outgoing ? 0 : 1;
    conversation.unread_count = conversation.unread_count ? conversation.unread_count + new_unread_count : new_unread_count;
   }
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
    unread_count: msg.is_outgoing ? 0 : 1,
   };
   ca.unshift(conversation);
  }
  acc_ca.set(ca);
 }

 export function openNewConversation(address) {
  console.log('openNewConversation', address);
  selectConversation({ acc: get(get(active_account)), address });
 }

 function eventNewMessage(acc, event) {
  const res = event.detail;
  if (!res.data) return;
  console.log('eventNewMessage', acc, res);
  const msg = new Message(acc, res.data);
  msg.received_by_my_homeserver = true;
  let sc = get(selectedConversation);
  if (msg.address_from !== acc.credentials.address) {
   console.log('showNotification?');
   if (!get(isClientFocused) || get(active_account) != acc || msg.address_from !== sc?.address) showNotification(acc, msg);
  }
  console.log('eventNewMessage updateConversationsArray with msg:', msg);
  updateConversationsArray(acc, msg);
  if (acc === get(active_account) && ((msg.address_from === sc?.address && msg.address_to === acc.credentials.address) || (msg.address_from === acc.credentials.address && msg.address_to === sc?.address))) {
   addMessagesToMessagesArray([msg]);
  }
 }

 function eventSeenMessage(acc, event) {
  console.log(event);
  const res = event.detail;
  console.log('eventSeenMessage', res);
  if (!res.data) return;
  console.log(get(messagesArray));
  const message = get(messagesArray).find(m => m.uid === res.data.uid);
  if (message) {
   message.seen = res.data.seen;
   messagesArray.update(v => v);
  } else console.log('eventSeenMessage: message not found by uid:', res);
 }

 function eventSeenInboxMessage(acc, event) {
  /*
 mark, as seen, a message sent to us. This can be triggered by another client.
 */
  console.log(event);
  const res = event.detail;
  console.log('eventSeenInboxMessage', res);
  if (!res.data) return;
  console.log(get(conversationsArray));
  const conversation = get(conversationsArray).find(c => c.address === res.data.address_from);
  if (conversation) {
   conversation.unread_count--;
   conversationsArray.update(v => v);
  } else console.log('eventSeenInboxMessage: conversation not found by address:', res);
 }

 function showNotification(acc, msg) {
  if (!acc) console.error('showNotification: no account');
  playNotificationSound();
  // TODO: distinguish if it's a web or native version
  if (Notification.permission !== 'granted') return;
  /*fixme*/
  const conversation = get(conversationsArray).find(c => c.address === msg.address_from);
  let notification;
  if (conversation) {
   /*fixme*/
   notification = new Notification('New message from: ' + conversation.visible_name + ' (' + msg.address_from + ')', {
    body: msg.stripped_text,
    icon: 'img/photo.svg',
    silent: true,
   });
  } else {
   notification = new Notification('New message from: ' + msg.address_from, {
    body: msg.stripped_text,
    icon: 'img/photo.svg',
    silent: true,
   });
  }
  notification.onclick = () => {
   window.focus();
   selectConversation({ acc, address: msg.address_from, visible_name: conversation?.visible_name });
  };
 }

 function playNotificationSound() {
  const audio = new Audio('audio/message.mp3');
  audio.play();
 }

 export function ensureConversationDetails(conversation) {
  console.log('ensureConversationDetails', conversation);
  if (conversation.visible_name) return;
  let acc = get(active_account);
  console.log('ensureConversationDetails acc:', acc);
  send(acc, 'core', 'user_userinfo_get', { address: conversation.address }, true, (_req, res) => {
   if (res.error !== 0) return;
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
