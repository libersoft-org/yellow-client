<script>
	import core from '@/core/core.ts';
	import Item from '../components/SidebarItem.svelte';
	import { page } from '../dating.js';
	const sections = [
		{ id: 'people', img: 'people.svg', label: 'People nearby' },
		{ id: 'map', img: 'map.svg', label: 'Map' },
		{ id: 'match', img: 'match.svg', label: 'Match game' },
		{ id: 'settings', img: 'settings.svg', label: 'Settings' },
	];

	function setPage(name) {
		page.set(name);
		core.hideSidebarMobile.set(true);
	}
</script>

<div class="sidebar">
	{#each sections as { id, img, label }}
		<Item {img} {label} active={$page === id} onClick={() => setPage(id)} />
	{/each}
</div>
