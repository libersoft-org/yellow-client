import { registerModule, type ModuleDeclaration } from '@/core/core.ts';
import Sidebar from './pages/sidebar.svelte';
import Content from './pages/content.svelte';

export const module = {
  name: 'iFrames',
  identifier: 'org.libersoft.iframes',
};

const moduleDeclaration: Partial<ModuleDeclaration> = {
  order: 5,
  callbacks: {},
  panels: {
    sidebar: Sidebar,
    content: Content,
  },
};

registerModule(module.identifier, moduleDeclaration as ModuleDeclaration);
