import { registerModule } from '@/core/core.ts';
import Sidebar from './pages/Main/Sidebar.svelte';
import Content from './pages/Main/Content.svelte';
export const module = {
	name: 'iFrames',
	identifier: 'org.libersoft.iframes',
};

registerModule({
	id: module.identifier,
	order: 5,
	callbacks: {},
	panels: {
		sidebar: Sidebar,
		content: Content,
	},
});
