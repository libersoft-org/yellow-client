import { registerModule } from '@/core/scripts/core.ts';
import { initData } from './contacts.ts';
import Sidebar from '../pages/Main/Sidebar.svelte';
import Content from '../pages/Main/Content.svelte';
export const module: IModule = {
	name: 'Contacts',
	identifier: 'org.libersoft.contacts',
};
interface IModule {
	name: string;
	identifier: string;
}

registerModule({
	id: module.identifier,
	order: 2,
	callbacks: { initData },
	panels: {
		sidebar: Sidebar,
		content: Content,
	},
});
