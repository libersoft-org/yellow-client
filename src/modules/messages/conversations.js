import { active_account, hideSidebarMobile } from '../core/core.js';
import { selectedConversation } from './messages.js';



export function selectConversation(conversation) {
 get(selectedConversation.update(() => conversation);
 hideSidebarMobile.update(() => true);
 listMessages(get(active_account), conversation.address);
}
