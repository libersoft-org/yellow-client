import { registerModule } from '../../core/core.js';
import { identifier, init, initData, initComms, deinitComms, deinitData, onModuleSelected } from './messages.js';
import MessagesSidebar from './pages/MessagesPage/MessagesSidebar.svelte';
import MessagesContent from './pages/MessagesPage/MessagesContent.svelte';
export const module = {
 name: 'Messages',
 identifier,
};

registerModule(module.identifier, {
 order: 1,
 callbacks: { init, initData, initComms, deinitComms, deinitData, onModuleSelected },
 panels: {
  sidebar: MessagesSidebar,
  content: MessagesContent,
 },
});
