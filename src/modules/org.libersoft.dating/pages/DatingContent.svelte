<script>
	import { page } from '../dating.js';
	import Content from '@/core/components/Content/Content.svelte';
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

<Content>
	{#if $page}
		<svelte:component this={pages[$page]} />
	{:else}
		<Welcome />
	{/if}
</Content>
