import { registerModule } from '../../core/core.js';
import Sidebar from './pages/dating-sidebar.svelte';
import Content from './pages/dating-content.svelte';

export const module = {
 name: 'Dating',
 identifier: 'org.libersoft.dating',
};

registerModule(module.identifier, {
 callbacks: {},
 panels: {
  sidebar: Sidebar,
  content: Content,
 },
});
