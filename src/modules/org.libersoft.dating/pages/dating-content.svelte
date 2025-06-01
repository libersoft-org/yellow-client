<script>
	import { page } from '../dating.js';
	import Map from './map.svelte';
	import Match from './match.svelte';
	import People from './people.svelte';
	import Settings from './settings.svelte';

	const pages = {
		map: Map,
		match: Match,
		people: People,
		settings: Settings,
	};
</script>

<style>
	.dating-content {
		height: 100vh;
		max-height: 100vh;
		background: var(--background-image) 0 0 / 400px repeat;
	}
</style>

<div class="dating-content">
	<svelte:component this={pages[$page]} />
</div>
