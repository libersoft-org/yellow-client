<script lang="ts">
	import { onMount } from 'svelte';
	import { page, setPage } from '../../dating.ts';
	import Content from '@/core/components/Content/Content.svelte';
	import Welcome from '../Welcome.svelte';
	import Map from '../Map.svelte';
	import Match from '../Match.svelte';
	import People from '../People.svelte';
	import Settings from '../Settings.svelte';

	const pages = {
		map: Map,
		match: Match,
		people: People,
		settings: Settings,
	};

	onMount(() => {
		if (!$page) setPage('people');
	});
</script>

<Content>
	{#if $page}
		<svelte:component this={pages[$page]} />
	{:else}
		<Welcome />
	{/if}
</Content>
