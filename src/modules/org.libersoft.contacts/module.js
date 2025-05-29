import { registerModule } from '@/core/core.js';
import { initData } from './contacts.js';
import ContactsSidebar from './pages/ContactsPage/ContactsSidebar.svelte';
import ContactsContent from './pages/ContactsPage/ContactsContent.svelte';

export const module = {
	name: 'Contacts',
	identifier: 'org.libersoft.contacts',
};

registerModule(module.identifier, {
	order: 2,
	callbacks: { initData },
	panels: {
		sidebar: ContactsSidebar,
		content: ContactsContent,
	},
});
