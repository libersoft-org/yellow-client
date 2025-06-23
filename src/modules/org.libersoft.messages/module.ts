import { registerModule } from '@/core/core.ts';
import { identifier, init, initData, initComms, deinitComms, deinitData, onModuleSelected } from './messages.js';
import Sidebar from './pages/Main/Sidebar.svelte';
import Content from './pages/Main/Content.svelte';
export const module = {
	name: 'Messages',
	identifier,
};

registerModule({
	id: module.identifier,
	order: 1,
	callbacks: { init, initData, initComms, deinitComms, deinitData, onModuleSelected },
	panels: {
		sidebar: Sidebar,
		content: Content,
	},
});
