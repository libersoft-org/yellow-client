import { registerModule, type ModuleDeclaration } from '@/core/core.ts';
import { initData } from './contacts.ts';
import ContactsSidebar from './pages/ContactsPage/ContactsSidebar.svelte';
import ContactsContent from './pages/ContactsPage/ContactsContent.svelte';

export const module = {
  name: 'Contacts',
  identifier: 'org.libersoft.contacts',
};

const moduleDeclaration: Partial<ModuleDeclaration> = {
  order: 2,
  callbacks: { initData },
  panels: {
    sidebar: ContactsSidebar,
    content: ContactsContent,
  },
};

registerModule(module.identifier, moduleDeclaration as ModuleDeclaration);
