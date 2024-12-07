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
 .items {
 }
</style>

<div class="items">
 <Item img="people.svg" label="People nearby" on:click={() => setPage('people')} />
 <Item img="map.svg" label="Map" on:click={() => setPage('map')} />
 <Item img="match.svg" label="Match game" on:click={() => setPage('match')} />
 <Item img="settings.svg" label="Settings" on:click={() => setPage('settings')} />
</div>
