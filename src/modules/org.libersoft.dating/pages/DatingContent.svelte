<script>
	import { page } from '../dating.js';
	import Welcome from './Welcome.svelte';
	import Map from './Map.svelte';
	import Match from './Match.svelte';
	import People from './People.svelte';
	import Settings from './Settings.svelte';

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
	{#if $page}
		<svelte:component this={pages[$page]} />
	{:else}
		<Welcome />
	{/if}
</div>
