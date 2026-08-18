<script lang="ts">
	import { liveQuery } from 'dexie';
	import { isMobile } from '@/core/scripts/stores.ts';
	import { sticker_server, updateStickerLibrary } from '@/org.libersoft.messages/scripts/stickers.ts';
	import { stickers_db } from '@/org.libersoft.messages/scripts/db.ts';
	import FuzzySearch from 'fuzzy-search';
	import { get } from 'svelte/store';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import StickersSearchResults from './StickersSearchResults.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import { onMount, onDestroy, untrack } from 'svelte';
	let { stickerset_favorites } = $props();
	let fulltext_search_element;
	let fulltext_search_filter = $state('');
	let animated_filter_dropdown_value = $state('all');
	let animated_filter = $derived(animated_filter_dropdown_value === 'all' ? [1, 0] : animated_filter_dropdown_value === 'animated' ? [1] : [0]);
	let items = $state([]);
	let loading = $state(true);
	let elStickersSearchResults: StickersSearchResults | null = $state(null);

	export function onShow(): void {
		if (!get(isMobile)) fulltext_search_element.focus();
	}

	onMount(() => {
		console.log('stickers-view onMount');
	});

	let query_store_unsubscribe;

	function triggerQuery(): void {
		const server = get(sticker_server);
		if (server) live_query(server, fulltext_search_filter, animated_filter);
	}

	function handleFilterChange(): void {
		triggerQuery();
	}

	function handleAnimatedFilterChange(): void {
		triggerQuery();
	}

	const unsubSticker = sticker_server.subscribe(() => triggerQuery());

	onDestroy(() => {
		unsubSticker();
		if (query_store_unsubscribe) query_store_unsubscribe.unsubscribe();
	});

	async function live_query(server: string, fulltext_search_filter: string, animated_filter: number[]): Promise<any> {
		loading = true;
		untrack(async () => {
			console.log('scroll_to_top:', elStickersSearchResults?.scroll_to_top);
			await elStickersSearchResults?.scroll_to_top?.();
		});
		console.log('update_live_query', fulltext_search_filter, animated_filter);
		let query_store = liveQuery(async () => {
			loading = true;
			let x = (stickers_db as any).stickersets;
			//console.log('x:', x);
			// TODO: x is now a dexie Table. We have one shot at ordering or filtering it at db level: https://dexie.org/docs/Dexie/Dexie.[table]
			x = x.orderBy('id');
			// TODO: x is now a Dexie Collection. We can now filter, sort and limit it further, but it's a different api: https://dexie.org/docs/Collection/Collection
			x = x.filter(item => item.server == server);
			maybe_trigger_auto_update(await x.count());
			x = x.filter(item => animated_filter.includes(item.animated ? 1 : 0));
			if (stickerset_favorites) x = x.filter(item => stickerset_favorites.includes(item.url));
			x = await x.toArray();
			//TODO: x is now an array of items. We can apply additional filtering, sorting and limiting using js.
			if (fulltext_search_filter != '') {
				fulltext_search_filter = fulltext_search_filter.toLowerCase();
				x = new FuzzySearch(x, ['name'], { caseSensitive: false, sort: true }).search(fulltext_search_filter);
			}
			return x;
		});
		if (query_store_unsubscribe) query_store_unsubscribe.unsubscribe();
		query_store_unsubscribe = query_store.subscribe(value => {
			items = value;
			loading = false;
		});
		return query_store;
	}

	async function maybe_trigger_auto_update(count: number): Promise<void> {
		if (count === 0) {
			console.log('No items found');
			let state = (window as any).stickerLibraryUpdaterState;
			console.log('state:', state);
			if (state.updated_once) return;
			await updateStickerLibrary();
		}
	}
</script>

<style>
	.filter {
		display: flex;
		gap: 10px;
		padding: 0 10px 10px 10px;
	}

	.loading {
		display: flex;
		justify-content: center;
	}
</style>

<div class="filter">
	<Input icon={{ img: 'img/search.svg', alt: 'Search' }} bind:this={fulltext_search_element} bind:value={fulltext_search_filter} onChange={handleFilterChange} placeholder="Search ..." />
	<Select bind:value={animated_filter_dropdown_value} onchange={handleAnimatedFilterChange}>
		<Option text="All" value="all" />
		<Option text="Animated only" value="animated" />
		<Option text="Static only" value="static" />
	</Select>
</div>
<!--
{#if $debug}
 <pre>
  stickerset_favorites: {JSON.stringify(stickerset_favorites)}
  animated_filter: {JSON.stringify(animated_filter)}
  fulltext_search_filter: {JSON.stringify(fulltext_search_filter)}
  items.length: {items.length}
 </pre>
{/if}
-->
{#if loading}
	<Spinner />
{:else if items.length === 0}
	<div class="loading">
		<div class="status">No items found</div>
	</div>
{:else}
	<StickersSearchResults {items} bind:this={elStickersSearchResults} />
{/if}
