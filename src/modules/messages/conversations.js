import { active_account, hideSidebarMobile, send } from '../../core/core.js';
import { selectedConversation, listMessages, stripHtml } from './messages.js';
import { get } from 'svelte/store';

export function selectConversation(conversation) {
 selectedConversation.update(() => conversation);
 hideSidebarMobile.update(() => true);
 listMessages(get(active_account), conversation.address);
}

export function listConversations(acc) {
 this.sendData(acc, 'conversations_list', null, true, (_req, res) => {
  if (res.error === 0 && res.data?.conversations) {
   let conversationsArray = acc.module_data.messages.conversationsArray;
   console.log('listConversations into:', conversationsArray);
   conversationsArray.set(res.data.conversations.map(sanitizeConversation));
  }
 });
}

function sanitizeConversation(c) {
 c.last_message_text = stripHtml(c.last_message_text);
 return c;
}
