import { get, writable } from 'svelte/store';
import { selectAccount, active_account, active_account_id, getGuid, hideSidebarMobile, isClientFocused, active_account_module_data, relay, send, selected_module_id } from '../../core/core.js';
import DOMPurify from 'dompurify';
import { db } from './db';

export const identifier = 'org.libersoft.messages';

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

export let md = active_account_module_data(identifier);
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
 return send(acc, identifier, command, params, sendSessionID, callback, quiet);
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
 sendData(acc, 'conversations_list', null, true, (_req, res) => {
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
 sendData(acc, 'user_unsubscribe', { event: 'new_message' });
 sendData(acc, 'user_unsubscribe', { event: 'seen_message' });
 sendData(acc, 'user_unsubscribe', { event: 'seen_inbox_message' });
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
 return sendData(acc, 'messages_list', { address: address, base, prev, next }, true, (_req, res) => {
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
 if (state.countAdded > 0) {
  insertEvent({ type: reason, array: arr });
 } else {
  insertEvent({ type: 'properties_update', array: arr });
 }
 return result;
}

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

  if (is_unread) {
   conversation.unread_count = (conversation.unread_count || 0) + 1;
  }

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
  let oldLen = get(messagesArray).length;
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
 const audio = new Audio('modules/org.libersoft.messages/audio/message.mp3');
 audio.play();
}

export function ensureConversationDetails(conversation) {
 //console.log('ensureConversationDetails', conversation);
 if (conversation.visible_name) return;
 let acc = get(active_account);
 //console.log('ensureConversationDetails acc:', acc);
 send(acc, 'core', 'user_userinfo_get', { address: conversation.address }, true, (_req, res) => {
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
 if (node.tagName === 'VIDEO') {
  node.removeAttribute('autoplay');
 }
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
 console.log('htmlEscape:', str);
 return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function stripHtml(html) {
 return html.replace(/<[^>]*>?/gm, '');
}

export function processMessage(content) {
 let html = saneHtml(content);
 return {
  type: 'html',
  body: html,
 };
}

export function messagebar_text_to_html(content) {
 let result = content;
 result = result.replaceAll(' ', '&nbsp;');
 result = result.replaceAll('\n', '<br />');
 result = linkify(result);
 result = replaceEmojisWithTags(result);
 return result;
}

function replaceEmojisWithTags(text) {
 // Enhanced pattern: Attempt to match each "emoji cluster" including ZWJ sequences.
 // Explanation:
 //   \p{Extended_Pictographic}        Match an extended pictographic character (i.e., an emoji).
 //   (?:\u200D\p{Extended_Pictographic})*
 //     - Then match (as many times as occur):
 //       - Zero-Width Joiner (ZWJ) followed by another Extended Pictographic
 //
 // The 'u' flag is required to handle Unicode property escapes correctly.
 /*
 Notes
   Complex Sequences: This pattern works for typical ZWJ sequences like family emojis (👨‍👩‍👧‍👦), combined flags, and some multi-part emoji.
   Variation Selectors: Many emojis also include variation selectors (e.g., \uFE0F). Often this is matched automatically within the same cluster, but for nuanced control, you might need additional logic.
   Browser/Runtime Compatibility: Unicode property escapes (\p{…}) and the u flag require more modern JavaScript engines. If older environments need support, consider a well-maintained polyfill or library such as emoji-regex.
 */
 /*
 // Example usage:
  const input = "Hello 🌍! This is a test: 🏳️‍🌈👨‍👩‍👧‍👦.";
  const output = replaceEmojisWithCodepoints(input);
  console.log(output);
 // Possible output:
 // "Hello <<<1F30D>>>! This is a test: <<<1F3F3 FE0F 200D 1F308>>><<<1F468 200D 1F469 200D 1F467 200D 1F466>>>."
 */
 const emojiRegex = /\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*/gu;

 return text.replace(emojiRegex, cluster => {
  // 'cluster' is the entire matched ZWJ sequence (or a single emoji if no ZWJs)
  console.log('cluster:', cluster);
  let cluster_array = emoji_cluster_to_array(cluster);
  let codepoints_array_text = encodeCodepoints(cluster_array);
  return `<Emoji codepoints="${codepoints_array_text}" ></Emoji>`;
 });
}

function emoji_cluster_to_array(cluster) {
 // Convert the emoji cluster to an array of codepoints
 const codepoints = [];
 for (const char of cluster) {
  codepoints.push(char.codePointAt(0));
 }
 return codepoints;
}

export function encodeCodepoints(codepoints) {
 return codepoints.map(cp => cp.toString(16).padStart(4, '0')).join(',');
}

export function emoji_render(codepoints) {
 return codepoints.map(codepoint => String.fromCodePoint(codepoint)).join('');
}

function linkify(text) {
 // Combine all patterns into one. We use non-capturing groups (?:) to avoid capturing groups we don't need.
 const combinedPattern = new RegExp(["(https?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})?(?::\\d+)?(?:\\/[^\\s]*)?)", "(ftps?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})?(?::\\d+)?(?:\\/[^\\s]*)?)", '(bitcoin:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)', '(ethereum:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)', '(mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})', '(tel:\\+?[0-9]{1,15})'].join('|'), 'g');
 return text.replace(combinedPattern, match => {
  // Directly use `match` as the URL/href. This ensures we handle all links in one pass.
  return `<a href="${match}" target="_blank">${match}</a>`;
 });
}

window.stickerLibraryUpdaterState = { updating: false };
import.meta.hot?.dispose(() => {
 window.stickerLibraryUpdaterState.updating = false;
});

export async function fetchStickerset(stickerServer, id = 0) {
 void "this is a simple fetch of a single sticker. There is some overlap with updateStickerLibrary, but it's not worth refactoring now.";
 id = Number(id);
 let response = await fetch(stickerServer + '/api/sets?id=' + id);
 response = await response.json();
 let sets = response?.data;
 let stickerset = sets[0];
 stickerset.url = stickerServer + '/api/sets?id=' + stickerset.id;
 stickerset.items.forEach(sticker => {
  sticker.url = stickerServer + '/download/' + (stickerset.animated ? 'animated' : 'static') + '/' + stickerset.alias + '/' + sticker.name;
 });
 return stickerset;
}

export async function updateStickerLibrary(stickerServer) {
 window.stickerLibraryUpdaterState.updating = true;
 console.log('loading list of stickersets from ' + stickerServer);
 let startFetchSets = Date.now();
 let response = await fetch(stickerServer + '/api/sets');
 response = await response.json();
 let sets = response?.data;
 console.log('discovered ' + sets.length + ' stickersets in ' + (Date.now() - startFetchSets) + 'ms');

 // delete all stickers that are part of stickerset that has server equal to stickerServer
 console.log('clearing old stickers from db...');
 let old_sets = await db.stickersets.where('server').equals(stickerServer).primaryKeys();
 console.log('delete old stickers...');
 await db.stickers.where('stickerset').anyOf(old_sets).delete();
 console.log('delete old sets:', old_sets.length, '...');
 await db.stickersets.where('server').equals(stickerServer).delete();
 console.log('done clearing old stickers from db.');
 console.log('cleared db.stickersets:', await db.stickersets.toArray());
 console.log('cleared db.stickers:', await db.stickers.toArray());

 let stickersets_batch = [];
 for (let i = 0; i < sets.length; i++) {
  let stickerset = sets[i];
  let stickers = stickerset.items;
  delete stickerset.items;
  stickerset.server = stickerServer;
  stickerset.url = stickerServer + '/api/sets?id=' + stickerset.id;
  if (i % 500 === 0) {
   console.log('loading stickerset ' + i + '/' + sets.length);
   await db.stickersets.bulkAdd(stickersets_batch);
   stickersets_batch = [];
  }
  stickersets_batch.push(stickerset);

  let stickers_batch = [];
  for (let sticker of stickers) {
   if (!window.stickerLibraryUpdaterState.updating) {
    console.log('sticker library update cancelled');
    return;
   }
   sticker.stickerset = stickerset.id;
   sticker.url = stickerServer + '/download/' + (stickerset.animated ? 'animated' : 'static') + '/' + stickerset.alias + '/' + sticker.name;
   stickers_batch.push(sticker);
  }
  await db.stickers.bulkAdd(stickers_batch);
 }
 await db.stickersets.bulkAdd(stickersets_batch);

 console.log('done loading, db.stickers.length:', await db.stickers.toArray().length);
}
