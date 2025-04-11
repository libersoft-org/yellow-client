<script>
 import Core from '../../../core/core.js';
 import Item from '../components/sidebar-item.svelte';
 import { page } from '../dating.js';

 function setPage(name) {
  page.set(name);
  Core.hideSidebarMobile.set(true);
 }
</script>

<style>
 .sidebar {
  overflow-y: auto;
 }
</style>

<div class="sidebar">
 <Item img="people.svg" label="People nearby" colorVariable="--icon-red" onClick={() => setPage('people')} />
 <Item img="map.svg" label="Map" colorVariable="--icon-red" onClick={() => setPage('map')} />
 <Item img="match.svg" label="Match game" colorVariable="--icon-red" onClick={() => setPage('match')} />
 <Item img="settings.svg" label="Settings" colorVariable="--icon-red" onClick={() => setPage('settings')} />
</div>
