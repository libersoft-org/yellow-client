import { registerModule, type ModuleDeclaration } from '@/core/core.ts';
/* note: components import wallet.ts, so everything is still imported on startup.. */
import Sidebar from './pages/wallet-sidebar.svelte';
import Content from './pages/wallet-content.svelte';

export const module = {
  name: 'Wallet',
  identifier: 'org.libersoft.wallet',
};

const moduleDeclaration: Partial<ModuleDeclaration> = {
  order: 3,
  callbacks: {},
  panels: {
    sidebar: Sidebar,
    content: Content,
  },
};

registerModule(module.identifier, moduleDeclaration as ModuleDeclaration);
