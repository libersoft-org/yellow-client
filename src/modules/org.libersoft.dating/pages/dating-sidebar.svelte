<script>
	import core from '@/core/core.js';
	import Item from '../components/sidebar-item.svelte';
	import { page } from '../dating.js';

	function setPage(name) {
		page.set(name);
		core.hideSidebarMobile.set(true);
	}
</script>

<style>
	.sidebar {
		overflow-y: auto;
	}
</style>

<div class="sidebar">
	<Item img="people.svg" label="People nearby" active={$page === 'people' ? true : false} onClick={() => setPage('people')} />
	<Item img="map.svg" label="Map" active={$page === 'map' ? true : false} onClick={() => setPage('map')} />
	<Item img="match.svg" label="Match game" active={$page === 'match' ? true : false} onClick={() => setPage('match')} />
	<Item img="settings.svg" label="Settings" active={$page === 'settings' ? true : false} onClick={() => setPage('settings')} />
</div>
