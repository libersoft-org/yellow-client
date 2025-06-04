<script>
	import { page, setPage } from '../dating.js';
	import SidebarCategory from '../components/SidebarCategory.svelte';
	const sections = [
		{ id: 'people', img: 'people.svg', label: 'People nearby' },
		{ id: 'map', img: 'map.svg', label: 'Map' },
		{ id: 'match', img: 'match.svg', label: 'Match game' },
		{ id: 'settings', img: 'settings.svg', label: 'Settings' },
	];
</script>

<div class="sidebar">
	{#each sections as { id, img, label }}
		<SidebarCategory {img} {label} active={$page === id} onClick={() => setPage(id)} />
	{/each}
</div>
