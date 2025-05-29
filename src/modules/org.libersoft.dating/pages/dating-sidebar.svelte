<script>
  import core from '@/core/core.js';
  import Item from '../components/sidebar-item.svelte';
  import { page } from '../dating.js';

  function setPage(name) {
    page.set(name);
    core.hideSidebarMobile.set(true);
  }
</script>

<div class="sidebar">
  <Item img="people.svg" label="People nearby" onClick={() => setPage('people')} />
  <Item img="map.svg" label="Map" onClick={() => setPage('map')} />
  <Item img="match.svg" label="Match game" onClick={() => setPage('match')} />
  <Item img="settings.svg" label="Settings" onClick={() => setPage('settings')} />
</div>

<style>
  .sidebar {
    overflow-y: auto;
  }
</style>
