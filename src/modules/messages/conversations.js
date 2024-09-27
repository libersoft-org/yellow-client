import { active_account, hideSidebarMobile } from '../../core/core.js';
import { selectedConversation, listMessages } from './messages.js';
import {get} from "svelte/store";

export function selectConversation(conversation) {
 selectedConversation.update(() => conversation);
 hideSidebarMobile.update(() => true);
 listMessages(get(active_account), conversation.address);
}
