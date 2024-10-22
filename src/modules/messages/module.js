import { registerModule } from '../../core/core.js';
import Sidebar from './pages/messages-sidebar.svelte';
import Content from './pages/messages-content.svelte';
import { initData, initComms, deinitComms, deinitData } from './messages.js';


export const module = {
 name: 'Messages',
 identifier: 'org.libersoft.messages',
};

registerModule(module.identifier, {
 callbacks: { initData, initComms, deinitComms, deinitData },
 panels: {
  sidebar: Sidebar,
  content: Content,
 },
});
