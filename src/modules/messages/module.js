import { registerModule } from '../../core/core.js';
import Sidebar from './pages/conversations-list.svelte';
import Content from './pages/conversations-main.svelte';

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
