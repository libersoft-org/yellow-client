import { registerModule } from '@/core/scripts/core.ts';
import { identifier, init, initData, initComms, deinitComms, deinitData, onModuleSelected } from '@/org.libersoft.messages/scripts/messages.js';
import Sidebar from '@/org.libersoft.messages/pages/Main/Sidebar.svelte';
import Content from '@/org.libersoft.messages/pages/Main/Content.svelte';
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
