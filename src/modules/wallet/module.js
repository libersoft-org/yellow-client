import { registerModule } from '../../core/core.js';

/* note: components import wallet.js, so everything is still imported on startup.. */

import WalletSidebar from './pages/wallet-sidebar.svelte';
import WalletContent from './pages/wallet-content.svelte';

registerModule('wallet', {
 callbacks: {},
 panels: {
  sidebar: WalletSidebar,
  content: WalletContent,
 },
});
