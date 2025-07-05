import { registerModule } from '@/core/core.ts';
import Sidebar from '../pages/Main/Sidebar.svelte';
import Content from '../pages/Main/Content.svelte';

export const module = {
	name: 'Wallet',
	identifier: 'org.libersoft.wallet',
};

registerModule({
	id: module.identifier,
	order: 3,
	callbacks: {},
	panels: {
		sidebar: Sidebar,
		content: Content,
	},
});
