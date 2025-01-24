import { replaceEmojisWithTags, start_emojisets_fetch } from './emojis.js';
import { get, writable } from 'svelte/store';
import { splitAndLinkify } from './splitAndLinkify';
import { selectAccount, active_account, active_account_id, getGuid, hideSidebarMobile, isClientFocused, active_account_module_data, relay, send, selected_module_id } from '../../core/core.js';
import DOMPurify from 'dompurify';
export const identifier = 'org.libersoft.messages';
export let md = active_account_module_data(identifier);
export let conversationsArray = relay(md, 'conversationsArray');
export let events = relay(md, 'events');
export let messagesArray = relay(md, 'messagesArray');
export let selectedConversation = relay(md, 'selectedConversation');
export let emojiGroups = relay(md, 'emojiGroups');
export let emojisByCodepointsRgi = relay(md, 'emojisByCodepointsRgi');

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

export function initData(acc) {
 let result = {
  selectedConversation: writable(null),
  conversationsArray: writable([]),
  events: writable([]),
  messagesArray: writable([]),
  emojiGroups: writable([]),
  emojisByCodepointsRgi: writable(null),
 };
 start_emojisets_fetch(acc, result.emojiGroups, result.emojisByCodepointsRgi);
 result.conversationsArray.subscribe(v => {
  //console.log('acc conversationsArray:', acc, v);
 });
 return result;
}

active_account_id.subscribe(acc => {
 get(md)?.['selectedConversation']?.set(null);
});

function sendData(acc, account, command, params = {}, sendSessionID = true, callback = null, quiet = false) {
 /*
 acc: account object
 account: account store, optional, for debugging
  */
 return send(acc, account, identifier, command, params, sendSessionID, callback, quiet);
}

export function onModuleSelected(selected) {
 //console.log(identifier + ' onModuleSelected', selected);
 if (!selected) get(md)?.['selectedConversation']?.set(null);
}

export function selectConversation(conversation) {
 console.log('SELECTcONVERSATION', conversation);
 selectedConversation.set(conversation);
 events.set([]);
 messagesArray.set([]);
 hideSidebarMobile.set(true);
 listMessages(conversation.acc, conversation.address);
}

export function listConversations(acc) {
 sendData(acc, null, 'conversations_list', null, true, (_req, res) => {
  if (res.error !== 0) {
   console.error('this is bad.');
   return;
  }
  if (res.data?.conversations) {
   let conversationsArray = acc.module_data[identifier].conversationsArray;
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
 sendData(acc, null, 'subscribe', { event: event_name }, true, (req, res) => {
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
 let data = acc.module_data[identifier];
 //console.log('initComms:', data);
 data.new_message_listener = event => eventNewMessage(acc, event);
 data.seen_message_listener = event => eventSeenMessage(acc, event);
 data.seen_inbox_message_listener = event => eventSeenInboxMessage(acc, event);
 acc.events.addEventListener('new_message', data.new_message_listener);
 acc.events.addEventListener('seen_message', data.seen_message_listener);
 acc.events.addEventListener('seen_inbox_message', data.seen_inbox_message_listener);
 listConversations(acc);
}

export function deinitComms(acc) {
 sendData(acc, null, 'user_unsubscribe', { event: 'seen_message' });
 sendData(acc, null, 'user_unsubscribe', { event: 'seen_inbox_message' });
 sendData(acc, null, 'user_unsubscribe', { event: 'new_message' });
}

export function deinitData(acc) {
 console.log('DEINIT DATA');
 let data = acc.module_data[identifier];
 if (!data) return;
 acc.events.removeEventListener('new_message', data.new_message_listener);
 acc.events.removeEventListener('seen_message', data.seen_message_listener);
 acc.events.removeEventListener('seen_inbox_message', data.seen_message_listener);
 data.events.set([]);
 data.messagesArray.set([]);
 data.conversationsArray.set([]);
 data.selectedConversation.set(null);
 acc.module_data[identifier] = null;
}

export function listMessages(acc, address) {
 console.log('listMessages', acc, address);
 messagesArray.set([{ type: 'initial_loading_placeholder' }]);
 loadMessages(acc, address, 'unseen', 3, 3, 'initial_load', res => {});
}

export function loadMessages(acc, address, base, prev, next, reason, cb) {
 return sendData(acc, null, 'messages_list', { address: address, base, prev, next }, true, (_req, res) => {
  if (res.error !== 0 || !res.data?.messages) {
   console.error(res);
   window.alert('Error while listing messages: ' + (res.message || JSON.stringify(res)));
   return;
  }
  let items = res.data.messages;
  items = constructLoadedMessages(acc, items);
  addMessagesToMessagesArray(items, reason);
  if (cb) cb(res);
 });
}

function addMessagesToMessagesArray(items, reason) {
 let arr = get(messagesArray);
 arr = arr.filter(m => m.type !== 'initial_loading_placeholder');
 let result = [];
 let state = { countAdded: 0 };
 for (let m of items) {
  result.push(addMessage(arr, m, state));
 }
 sortMessages(arr);
 addMissingPrevNext(arr);
 //console.log('messagesArray.set:', arr);
 messagesArray.set(arr);
 if (state.countAdded > 0) insertEvent({ type: reason, array: arr });
 else insertEvent({ type: 'properties_update', array: arr });
 return result;
}

/*
export function handleResize(wasScrolledToBottom) {
 insertEvent({ type: 'resize', {wasScrolledToBottom} });
}
*/

export function snipeMessage(msg) {
 messagesArray.update(v => {
  return v.filter(m => m.uid !== msg.uid);
 });
 insertEvent({ type: 'gc', array: get(messagesArray) });
}

function addMessage(arr, msg, state) {
 void 'todo: this should only update the message if the data is actually more up-to-date';
 let m = arr.find(m => m.uid === msg.uid);
 if (m) {
  for (let key in msg) m[key] = msg[key];
  return m;
 } else {
  arr.unshift(msg);
  state.countAdded++;
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
  } else if (akey === undefined) return 1;
  else if (bkey === undefined) return -1;
  if (akey > bkey) return 1;
  if (akey < bkey) return -1;
  return 0;
 });
}

function addMissingPrevNext(messages) {
 for (let i = 0; i < messages.length; i++) {
  let m = messages[i];
  if (m.prev === undefined) m.prev = findPrev(messages, i);
  if (m.next === undefined) m.next = findNext(messages, i);
  else if (m.next === 'none') {
   let next = findNext(messages, i);
   if (next !== undefined) m.next = next;
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
 sendData(acc, active_account, 'message_seen', { uid: message.uid }, true, (req, res) => {
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

export function sendMessage(text, format) {
 let acc = get(active_account);
 let message = new Message(acc, {
  uid: getGuid(),
  address_from: acc.credentials.address,
  address_to: get(selectedConversation).address,
  message: text,
  format,
  created: new Date().toISOString().replace('T', ' ').replace('Z', ''),
  just_sent: true,
 });
 let params = { address: message.address_to, message: message.message, format, uid: message.uid };
 sendData(acc, active_account, 'message_send', params, true, (req, res) => {
  if (res.error !== 0) {
   alert('Error while sending message: ' + res.message);
   return;
  }
  // update the message status and trigger the update of the messagesArray:
  message.received_by_my_homeserver = true;
  messagesArray.update(v => v);
  insertEvent({ type: 'properties_update', array: get(messagesArray) });
 });
 addMessagesToMessagesArray([message], 'send_message');
 updateConversationsArray(acc, message);
}

function updateConversationsArray(acc, msg) {
 let acc_ca = acc.module_data[identifier].conversationsArray;
 let ca = get(acc_ca);
 const conversation = ca.find(c => c.address === msg.remote_address);
 console.log('updateConversationsArray', conversation, msg);
 let is_unread = !msg.seen && !msg.just_sent && msg.address_from !== acc.credentials.address;
 if (conversation) {
  conversation.last_message_date = msg.created;
  conversation.last_message_text = msg.stripped_text;
  if (is_unread) conversation.unread_count = (conversation.unread_count || 0) + 1;
  // shift the affected conversation to the top:
  const index = ca.indexOf(conversation);
  ca.splice(index, 1);
  ca.unshift(conversation);
 } else {
  let conversation = {
   acc,
   address: msg.remote_address,
   last_message_date: msg.created,
   last_message_text: msg.stripped_text,
   visible_name: null,
   unread_count: is_unread ? 1 : 0,
  };
  ca.unshift(conversation);
 }
 acc_ca.set(ca);
}

export function openNewConversation(address) {
 console.log('openNewConversation', address);
 selectConversation({ acc: get(active_account), address });
}

export function startReply(message) {
 message.reply = { text: 'funny.' };
 messagesArray.update(v => v);
 insertEvent({ type: 'properties_update', array: get(messagesArray) });
}

export function insertEvent(event) {
 events.update(v => {
  console.log('insertEvent: ', v, event);
  return [...v, event];
 });
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
 console.log('eventNewMessage updateConversationsArray with msg:', msg);
 updateConversationsArray(acc, msg);
 if (acc !== get(active_account)) return;
 if ((msg.address_from === sc?.address && msg.address_to === acc.credentials.address) || (msg.address_from === acc.credentials.address && msg.address_to === sc?.address)) {
  //let oldLen = get(messagesArray).length;
  msg = addMessagesToMessagesArray([msg], 'new_message')[0];
 }
}

function eventSeenMessage(acc, event) {
 if (acc !== get(active_account)) {
  console.log('eventSeenMessage: acc !== get(active_account)', acc, get(active_account));
  return;
 }
 console.log(event);
 const res = event.detail;
 console.log('eventSeenMessage', res);
 if (!res.data) {
  console.log('eventSeenMessage: no data');
  return;
 }
 console.log('messagesArray:', get(messagesArray));
 const message = get(messagesArray).find(m => m.uid === res.data.uid);
 console.log('eventSeenMessage: message found by uid:', message);
 if (message) {
  message.seen = res.data.seen;
  messagesArray.update(v => v);
  console.log('insertEvent..');
  insertEvent({ type: 'properties_update', array: get(messagesArray) });
 } else console.log('eventSeenMessage: message not found by uid:', res);
}

function eventSeenInboxMessage(acc, event) {
 /*
  mark, as seen, a message sent to us. This can be triggered by another client.
 */
 if (acc !== get(active_account)) return;
 //console.log(event);
 const res = event.detail;
 //console.log('eventSeenInboxMessage', res);
 if (!res.data) return;
 //console.log(get(conversationsArray));
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
 /* TODO: fixme*/
 const conversation = get(conversationsArray).find(c => c.address === msg.address_from);
 console.log('new Notification', conversation);
 let notification;
 if (conversation) {
  /*TODO: fixme*/
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
  selectAccount(acc.id);
  selected_module_id.set(identifier);
  console.log('notification click: selectConversation', msg.address_from);
  selectConversation({ acc, address: msg.address_from, visible_name: conversation?.visible_name });
 };
}

function playNotificationSound() {
 const audio = new Audio('modules/' + identifier + '/audio/message.mp3');
 audio.play();
}

export function ensureConversationDetails(conversation) {
 //console.log('ensureConversationDetails', conversation);
 if (conversation.visible_name) return;
 let acc = get(active_account);
 //console.log('ensureConversationDetails acc:', acc);
 send(acc, active_account, 'core', 'user_userinfo_get', { address: conversation.address }, true, (_req, res) => {
  if (res.error !== 0) return;
  Object.assign(conversation, res.data);
  conversationsArray.update(v => v);
 });
}

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
 if (node.tagName === 'A') {
  node.setAttribute('target', '_blank');
  node.setAttribute('rel', 'noopener noreferrer');
 }
 if (node.tagName === 'VIDEO') node.removeAttribute('autoplay');
});

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
 if (data.tagName && data.tagName.toLowerCase() === 'sticker') {
  // Move children out to after the node. This is a hack to tolerate improperly closed sticker tag.
  while (node.firstChild) {
   node.parentNode.insertBefore(node.firstChild, node.nextSibling);
  }
 }
});

export function saneHtml(content) {
 //console.log('saneHtml:');
 let sane = DOMPurify.sanitize(content, {
  ADD_TAGS: ['Sticker', 'Gif', 'Emoji'],
  //FORBID_CONTENTS: ['sticker'],
  ADD_ATTR: ['file', 'set', 'alt', 'codepoints'], // TODO: fixme, security issue, should only be allowed on the relevant elements
  RETURN_DOM_FRAGMENT: true,
 });
 /*console.log('content:');
 console.log(content);
 console.log('sane:');
 console.log(sane);*/
 return sane;
}

export function htmlEscape(str) {
 //console.log('htmlEscape:', str);
 return str.replaceAll(/&/g, '&amp;').replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/"/g, '&quot;').replaceAll(/'/g, '&#039;').replaceAll(' ', '&nbsp;');
}

export function stripHtml(html) {
 return html.replace(/<[^>]*>?/gm, '');
}

export function processMessage(message) {
 let html;
 if (message.format === 'html') {
  html = saneHtml(message.message);
 } else {
  html = saneHtml(preprocess_incoming_plaintext_message_text(message.message));
 }
 //html = group_downloads(html);
 return {
  format: 'html',
  body: html,
 };
}

function group_downloads(html) {
 void 'walk the dom tree, find runs of multiple Download elements, and group them under a single DownloadGroup element';
 return group_downloads_walk(html);
}

function group_downloads_walk(node) {
 /* todo review, autogenerated */
 if (node.nodeType === Node.TEXT_NODE) return node;
 if (node.nodeType === Node.ELEMENT_NODE) {
  if (node.tagName === 'DOWNLOAD') {
   let group = document.createElement('DOWNLOADGROUP');
   group.appendChild(node);
   while (node.nextSibling && node.nextSibling.tagName === 'DOWNLOAD') {
    group.appendChild(node.nextSibling);
    node = node.nextSibling;
   }
   return group;
  }
  let clone = node.cloneNode();
  for (let child of node.childNodes) {
   clone.appendChild(group_downloads_walk(child));
  }
  return clone;
 }
}

export function preprocess_incoming_plaintext_message_text(content) {
 let result0 = content;
 //console.log('splitAndLinkify input:', result0);
 let result1 = splitAndLinkify(result0);
 //console.log('splitAndLinkify output:', result1);
 let result2 = result1.map(part => {
  if (part.type === 'plain') {
   let r = htmlEscape(part.value);
   r = r.replaceAll('\n', '<br />');
   r = replaceEmojisWithTags(r);
   return r;
  } else if (part.type === 'processed') return part.value;
 });
 let result3 = result2.join('');
 // console.log('result0:', result0);
 // console.log('result1:', result1);
 // console.log('result2:', result2);
 // console.log('result3:', result3);
 return result3;
}

function emoji_cluster_to_array(cluster) {
 // Convert the emoji cluster to an array of codepoints
 const codepoints = [];
 for (const char of cluster) {
  codepoints.push(char.codePointAt(0));
 }
 return codepoints;
}

function linkify(text) {
 //console.log('linkify ', text);
 // Combine all patterns into one. We use non-capturing groups (?:) to avoid capturing groups we don't need.
 const combinedPattern = new RegExp(["(https?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})?(?::\\d+)?(?:\\/[^\\s]*)?)", "(ftps?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})?(?::\\d+)?(?:\\/[^\\s]*)?)", '(bitcoin:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)', '(ethereum:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)', '(mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})', '(tel:\\+?[0-9]{1,15})'].join('|'), 'g');
 let result = text.replace(combinedPattern, match => {
  // Directly use `match` as the URL/href. This ensures we handle all links in one pass.
  return `<a href="${match}" target="_blank">${match}</a>`;
 });
 //console.log('linkify result:', result);
 return result;
}
