import { registerModule } from '@/core/core.js';
import Sidebar from './pages/sidebar.svelte';
import Content from './pages/content.svelte';
export const module = {
	name: 'iFrames',
	identifier: 'org.libersoft.iframes',
};

registerModule(module.identifier, {
	order: 5,
	callbacks: {},
	panels: {
		sidebar: Sidebar,
		content: Content,
	},
});
