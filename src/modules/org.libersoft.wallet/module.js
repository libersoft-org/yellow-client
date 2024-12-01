import { registerModule } from '../../core/core.js';
/* note: components import wallet.ts, so everything is still imported on startup.. */
import Sidebar from './pages/wallet-sidebar.svelte';
import Content from './pages/wallet-content.svelte';

export const module = {
 name: 'Wallet',
 identifier: 'org.libersoft.wallet',
};

registerModule(module.identifier, {
 callbacks: {},
 panels: {
  sidebar: Sidebar,
  content: Content,
 },
});
