import { registerModule } from '../../core/core.js';
import { identifier, initData, initComms, deinitComms, deinitData, onModuleSelected } from './messages.js';
import Sidebar from './pages/messages-sidebar.svelte';
import Content from './pages/messages-content.svelte';
export const module = {
 name: 'Messages',
 identifier,
};

registerModule(module.identifier, {
 callbacks: { initData, initComms, deinitComms, deinitData, onModuleSelected },
 panels: {
  sidebar: Sidebar,
  content: Content,
 },
});
