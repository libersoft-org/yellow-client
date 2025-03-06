import { registerModule } from '../../core/core.js';
import Sidebar from './pages/dating-sidebar.svelte';
import Content from './pages/dating-content.svelte';
import { identifier, initData, initComms, deinitComms } from './dating.js';

export const module = {
 name: 'Dating',
 identifier,
};

registerModule(module.identifier, {
 order: 5,
 callbacks: { initData, initComms, deinitComms },
 panels: {
  sidebar: Sidebar,
  content: Content,
 },
});
