import { registerModule } from '@/core/core.ts';
import Sidebar from './pages/Main/Sidebar.svelte';
import Content from './pages/Main/Content.svelte';
export const module: Module = {
	name: 'Dating',
	identifier: 'org.libersoft.dating',
};
interface Module {
	name: string;
	identifier: string;
}

registerModule({
	id: module.identifier,
	order: 4,
	callbacks: {},
	panels: {
		sidebar: Sidebar,
		content: Content,
	},
});
