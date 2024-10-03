import { registerModule } from '../../core/core.js';

import Sidebar from './pages/sidebar.svelte';
import Content from './pages/content.svelte';

registerModule('iframes', {
 callbacks: {},
 panels: {
  sidebar: Sidebar,
  content: Content,
 },
});
