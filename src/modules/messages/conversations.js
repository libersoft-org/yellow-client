import { active_account, module_data, hideSidebarMobile } from '../core/core.js';



export function selectConversation(conversation) {
 get(module_data('messages')).selectedConversation.update(() => conversation);
 hideSidebarMobile.update(() => true);
 listMessages(get(active_account), conversation.address);
}
