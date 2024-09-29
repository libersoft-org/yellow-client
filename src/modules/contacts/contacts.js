import { registerModule } from '../../core/core.js';

import ContactsList from './pages/contacts-list.svelte';
import Contact from './pages/contact-detail.svelte';

function initData(acc) {
 let result = {
 };
 return result;
}

registerModule('contacts', {
 callbacks: { initData },
 panels: {
  sidebar: ContactsList,
  content: Contact,
 },
});
