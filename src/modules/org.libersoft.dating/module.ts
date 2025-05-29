import { registerModule, type ModuleDeclaration } from '@/core/core.ts';
import Sidebar from './pages/dating-sidebar.svelte';
import Content from './pages/dating-content.svelte';

export const module = {
  name: 'Dating',
  identifier: 'org.libersoft.dating',
};

const moduleDeclaration: Partial<ModuleDeclaration> = {
  order: 4,
  callbacks: {},
  panels: {
    sidebar: Sidebar,
    content: Content,
  },
};

registerModule(module.identifier, moduleDeclaration as ModuleDeclaration);
