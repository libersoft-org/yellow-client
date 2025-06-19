import { registerModule } from '@/core/core.ts';
import { initData } from './contacts.ts';
import Sidebar from './pages/Main/Sidebar.svelte';
import Content from './pages/Main/Content.svelte';
export const module: Module = {
	name: 'Contacts',
	identifier: 'org.libersoft.contacts',
};
interface Module {
	name: string;
	identifier: string;
}

registerModule(module.identifier, {
	order: 2,
	callbacks: { initData },
	panels: {
		sidebar: Sidebar,
		content: Content,
	},
});
