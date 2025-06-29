<script lang="ts">
	import { debug } from '@/core/stores.ts';
	import { identifier } from '../../messages.js';
	import { sticker_server, stickerLibraryUpdaterState, updateStickerLibrary } from '../../stickers.js';
	import { liveQuery } from 'dexie';
	import { stickers_db } from '../../db.ts';
	import FuzzySearch from 'fuzzy-search';
	import { writable, get } from 'svelte/store';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import StickersSearchResults from './StickersSearchResults.svelte';
	import { isMobile } from '@/core/stores.ts';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import { onMount, untrack } from 'svelte';
	let { stickerset_favorites } = $props();
	let fulltext_search_element;
	let fulltext_search_filter = $state('');
	let animated_filter_dropdown_value = $state('all');
	let scroll_to_top = $state(null);
	$effect(() => console.log('animated_filter_dropdown_value:', animated_filter_dropdown_value));
	let animated_filter = $derived(animated_filter_dropdown_value === 'all' ? [1, 0] : animated_filter_dropdown_value === 'animated' ? [1] : [0]);

	let items = $state([]);
	let loading = $state(true);

	export function onShow() {
		if (!get(isMobile)) fulltext_search_element.focus();
	}

	onMount(() => {
		console.log('stickers-view onMount');
	});

	let query_store_unsubscribe;

	$effect(async () => {
		console.log('stickerset_favorites:', stickerset_favorites, '$sticker_server:', $sticker_server, 'fulltext_search_filter:', fulltext_search_filter, 'animated_filter:', animated_filter);
	});

	$effect(async () => live_query($sticker_server, fulltext_search_filter, animated_filter));

	async function live_query(server, fulltext_search_filter, animated_filter) {
		loading = true;
		untrack(async () => {
			console.log('scroll_to_top:', scroll_to_top);
			await scroll_to_top?.();
		});
		console.log('update_live_query', fulltext_search_filter, animated_filter);
		let query_store = liveQuery(async () => {
			loading = true;
			let x = stickers_db.stickersets;
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

	//$effect(() => console.log('Stickers.svelte items $effect:', $items));

	async function maybe_trigger_auto_update(count) {
		if (count === 0) {
			console.log('No items found');
			let state = window.stickerLibraryUpdaterState;
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
	<Input icon={{ img: 'img/search.svg', alt: 'Search' }} bind:this={fulltext_search_element} bind:value={fulltext_search_filter} placeholder="Search ..." />
	<Select bind:value={animated_filter_dropdown_value}>
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
	<StickersSearchResults bind:scroll_to_top {items} />
{/if}
