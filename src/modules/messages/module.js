import { registerModule } from '../../core/core.js';
import MessagesSidebar from './pages/conversations-list.svelte';
import MessagesContent from './pages/conversations-main.svelte';

const module = {
 name: 'Messages',
 identifier: 'org.libersoft.messages',
};

registerModule(module.identifier, {
 callbacks: { initData, initComms, deinitComms, deinitData },
 panels: {
  sidebar: MessagesSidebar,
  content: MessagesContent,
 },
});
