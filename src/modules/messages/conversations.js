
import { account } from '../core/core.js';

export function selectConversation(conversation) {
 selectedConversation.update(() => conversation);
 Core.hideSidebarMobile.update(() => true);
 listMessages(get(account), conversation.address);
}
