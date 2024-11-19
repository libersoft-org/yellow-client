import { get, writable } from 'svelte/store';
import { active_account, active_account_id, getGuid, hideSidebarMobile, isClientFocused, active_account_module_data, relay, send } from '../../core/core.js';
import DOMPurify from 'dompurify';
import { module } from './module.js';


class Message {
 constructor(acc, data) {
  Object.assign(this, data);
  this.acc = new WeakRef(acc);
  this.stripped_text = stripHtml(this.message);
  //console.log('Message address_from: ' + this.address_from + ' acc:' + acc.credentials.address);
  this.is_outgoing = this.address_from === acc.credentials.address;
  if (this.address_to === acc.credentials.address) this.remote_address = this.address_from;
  else this.remote_address = this.address_to;
 }
}


export let md = active_account_module_data(module.identifier);
export let conversationsArray = relay(md, 'conversationsArray');
export let events = relay(md, 'events');
export let messagesArray = relay(md, 'messagesArray');
export let selectedConversation = relay(md, 'selectedConversation');


export function initData(acc) {
 let result = {
  selectedConversation: writable(null),
  conversationsArray: writable([]),
  events: writable([]),
  messagesArray: writable([]),
 };
 result.conversationsArray.subscribe(v => {
  //console.log('acc conversationsArray:', acc, v);
 });
 return result;
}


active_account_id.subscribe(acc => {
 get(md)?.['selectedConversation']?.set(null);
});


function sendData(acc, command, params = {}, sendSessionID = true, callback = null, quiet = false) {
 return send(acc, module.identifier, command, params, sendSessionID, callback, quiet);
}


export function selectConversation(conversation) {
 console.log('SELECTcONVERSATIONSELECTcONVERSATIONSELECTcONVERSATIONSELECTcONVERSATION', conversation);
 selectedConversation.update(() => conversation);
 hideSidebarMobile.update(() => true);
 events.set([]);
 messagesArray.set([]);
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
   //console.log('listConversations into:', conversationsArray);
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

 data.events.set([]);
 data.messagesArray.set([]);
 data.conversationsArray.set([]);
 data.selectedConversation.set(null);

 acc.module_data[module.identifier] = null;
}


export function listMessages(acc, address) {
 console.log('listMessages', acc, address);
 events.set(['initial_loading']);
 messagesArray.set([{ type: 'initial_loading_placeholder' }]);
 loadMessages(acc, address);
}


export function loadMessages(acc, address, base = 'unseen', prev = 3, next = 3, cb) {
 return sendData(acc, 'messages_list', { address: address, base, prev, next }, true, (_req, res) => {
  if (cb) cb(res);

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
 let result = [];
 for (let m of items) {
  result.push(addMessage(arr, m));
 }
 sortMessages(arr);
 addMissingPrevNext(arr);
 console.log('messagesArray.set:', arr);
 messagesArray.set(arr);
 return result;
}


function addMessage(arr, msg) {
 void "todo: this should only update the message if the data is actually more up-to-date";
 let m = arr.find(m => m.uid === msg.uid);
 if (m) {
  for (let key in msg) m[key] = msg[key];
  return m;
 } else {
  arr.unshift(msg);
  return msg;
 }
}


function constructLoadedMessages(acc, data) {
 let items = data.map(msg => {
  let message = new Message(acc, msg);
  message.received_by_my_homeserver = true;
  message.is_lazyloaded = true;
  return message;
 });
 return items;
}


function sortMessages(messages) {
 messages.sort((a, b) => {
  void "take care of just-sent messages, they don't have id yet";
  //console.log(a.created, b.created);
  let akey = a.id;
  let bkey = b.id;
  if (akey === undefined && bkey === undefined) {
   akey = a.created;
   bkey = b.created;
  }
  else if (akey === undefined) return 1;
  else if (bkey === undefined) return -1;
  if (akey > bkey) return 1;
  if (akey < bkey) return -1;
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
  message.just_marked_as_seen = true;
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
   just_sent: true,
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
  events.update(v => [...v, {type: 'new_message', array: get(messagesArray)}]);
  updateConversationsArray(acc, message);
 }


 function updateConversationsArray(acc, msg) {
  const msg_created = msg.created;
  let acc_ca = acc.module_data[module.identifier].conversationsArray;
  let ca = get(acc_ca);
  const conversation = ca.find(c => c.address === msg.remote_address);
  console.log('updateConversationsArray', conversation, msg);

  if (conversation) {
   conversation.last_message_date = msg_created;
   conversation.last_message_text = msg.stripped_text;
   if (!msg.seen && !msg.just_sent) {
    conversation.unread_count = (conversation.unread_count || 0) + 1;
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
    unread_count: msg.just_sent ? 0 : 1,
   };
   ca.unshift(conversation);
  }
  acc_ca.set(ca);
 }


 export function openNewConversation(address) {
  console.log('openNewConversation', address);
  selectConversation({ acc: get(active_account), address });
 }


 function eventNewMessage(acc, event) {
  const res = event.detail;
  if (!res.data) return;
  console.log('eventNewMessage', acc, res);
  let msg = new Message(acc, res.data);
  msg.received_by_my_homeserver = true;
  let sc = get(selectedConversation);
  if (msg.address_from !== acc.credentials.address) {
   console.log('showNotification?');
   if (!get(isClientFocused) || get(active_account) != acc || msg.address_from !== sc?.address) showNotification(acc, msg);
  }
  if (acc !== get(active_account)) return;
  console.log('eventNewMessage updateConversationsArray with msg:', msg);
  if (((msg.address_from === sc?.address && msg.address_to === acc.credentials.address) || (msg.address_from === acc.credentials.address && msg.address_to === sc?.address))) {
   msg = addMessagesToMessagesArray([msg])[0];
   events.update(v => [...v, {type: 'new_message', array: get(messagesArray)}]);
  }
  updateConversationsArray(acc, msg);
 }


 function eventSeenMessage(acc, event) {
  if (acc !== get(active_account)) return;
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
  if (acc !== get(active_account)) return;
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
