import { registerModule } from '../../core/core.js';
import { initData } from './contacts.js';
import Sidebar from './pages/contacts-sidebar.svelte';
import Content from './pages/contacts-content.svelte';

export const module = {
 name: 'Contacts',
 identifier: 'org.libersoft.contacts',
};

registerModule(module.identifier, {
 callbacks: { initData },
 panels: {
  sidebar: Sidebar,
  content: Content,
 },
});
