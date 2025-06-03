import { registerModule } from '@/core/core.js';
import Sidebar from './pages/DatingSidebar.svelte';
import Content from './pages/DatingContent.svelte';

export const module = {
	name: 'Dating',
	identifier: 'org.libersoft.dating',
};

registerModule(module.identifier, {
	order: 4,
	callbacks: {},
	panels: {
		sidebar: Sidebar,
		content: Content,
	},
});
