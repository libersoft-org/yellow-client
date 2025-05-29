import { registerModule, type ModuleDeclaration } from '@/core/core.ts';
import { identifier, init, initData, initComms, deinitComms, deinitData, onModuleSelected } from './messages.ts';
import MessagesSidebar from './pages/MessagesPage/MessagesSidebar.svelte';
import MessagesContent from './pages/MessagesPage/MessagesContent.svelte';

export const module = {
  name: 'Messages',
  identifier,
};

const moduleDeclaration: Partial<ModuleDeclaration> = {
  order: 1,
  callbacks: { init, initData, initComms, deinitComms, deinitData, onModuleSelected },
  panels: {
    sidebar: MessagesSidebar,
    content: MessagesContent,
  },
};

registerModule(module.identifier, moduleDeclaration as ModuleDeclaration);
