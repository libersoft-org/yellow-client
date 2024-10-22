import { registerModule } from '../../core/core.js';

/* note: components import wallet.ts, so everything is still imported on startup.. */

import WalletSidebar from './pages/wallet-sidebar.svelte';
import WalletContent from './pages/wallet-content.svelte';

const module = {
 name: 'Messages',
 identifier: 'org.libersoft.messages',
};

registerModule(module.identifier, {
 callbacks: {},
 panels: {
  sidebar: WalletSidebar,
  content: WalletContent,
 },
});
