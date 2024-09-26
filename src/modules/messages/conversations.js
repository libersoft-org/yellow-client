export function selectConversation(acc, conversation) {
 selectedConversation.update(() => conversation);
 Core.hideSidebarMobile.update(() => true);
 listMessages(acc, conversation.address);
}
