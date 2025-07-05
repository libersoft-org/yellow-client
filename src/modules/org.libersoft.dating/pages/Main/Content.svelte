<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { setModule } from '@/core/core.ts';
	import { page, setPage, closePage } from '../../scripts/dating.ts';
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
		window.addEventListener('keydown', onKeydown);
		if (!$page) setPage('people');
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown);
	});

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if ($page) closePage();
			else setModule(null);
		}
	}
</script>

<Content>
	{#if $page && $page in pages}
		<svelte:component this={pages[$page as keyof typeof pages]} />
	{:else}
		<Welcome />
	{/if}
</Content>
