<script>
	import { add_stickerset_to_favorites, remove_stickerset_from_favorites, stickerset_in_favorites, stickerset_favorites } from '../../stickers.js';
	import { debug } from '@/core/core.js';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import StickerSetPart from './StickerSetPart.svelte';
	import { stickers_db } from '../../db.ts';
	import { onDestroy, onMount } from 'svelte';
	export let intersecting = true;
	export let stickerset = {};
	export let showall = false;
	let splitAt = 8;
	let stickers = undefined;
	/*
  TODO: stickers-search-results constructs Stickerset with stickerset parameter, which contains the metadata, but not items.
  Items are fetched from the database by update here. But the other case is when Stickerset is a child of stickerset-details-svelte. In that case,
  the items are passed in the stickerset object. So, we need to check if the items are already there, and if not, fetch them from the database.
 */
	let first, rest;
	let expanded = false;
	let clientHeight;
	let in_favorites = false;
	$: update(intersecting);
	$: first = showall ? stickers : stickers?.slice(0, splitAt);
	$: rest = showall ? [] : stickers?.slice(splitAt);
	stickerset_favorites.subscribe(value => (in_favorites = stickerset_in_favorites(stickerset)));
	let favorite_alt;
	$: favorite_alt = in_favorites ? 'Remove from favorites' : 'Add to favorites';
	let favorite_icon;
	$: favorite_icon = in_favorites ? 'full' : 'empty';

	/*
 $: console.log('library stickerset', stickerset);
 $: console.log('library stickers', stickers);
 $: console.log('library first', first);
 $: console.log('library rest', rest);
 */

	onMount(() => {
		//console.log(`stickerset ${stickerset.id} mounted, intersecting: ${intersecting}`);
	});

	onDestroy(() => {
		//console.log(`stickerset ${stickerset.id} destroyed`);
	});

	async function update(intersecting) {
		//console.log(`stickerset ${stickerset.id} intersecting: ${intersecting}`);
		if (intersecting) {
			if (stickers === undefined) {
				//console.log('stickerset', stickerset);
				if (stickerset.items) stickers = stickerset.items;
				else stickers = await stickers_db.stickers.where('stickerset').equals(stickerset.id).toArray();
			}
		}
	}

	function clickExpand() {
		expanded = !expanded;
	}

	function toggleFavorite() {
		if (stickerset_in_favorites(stickerset)) {
			remove_stickerset_from_favorites(stickerset);
		} else {
			add_stickerset_to_favorites(stickerset);
		}
	}
</script>

<style>
	.stickerset {
		display: flex;
		flex-direction: column;
		gap: 5px;
		padding: 0 10px;
	}

	.title-bar {
		display: flex;
		border-radius: 10px;
		background-color: #ddd;
	}

	.title-bar .left {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		padding: 10px;
	}

	.title-bar .left .label {
		font-weight: bold;
	}

	.title-bar .left .created {
		font-size: 12px;
	}

	.set {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 5px;
	}
</style>

<div class="stickerset" style="content-visibility: {intersecting ? 'visible' : 'hidden'}" role="none" bind:clientHeight>
	<div class="title-bar">
		<div class="left">
			<div class="label">{stickerset.name}</div>
			{#if $debug}
				<div>ID: {stickerset.id}</div>
				<!--<details><summary>stickerset</summary>{JSON.stringify(stickerset, null, 2)}</details>-->
			{/if}
			<div class="created">Added: {new Date(stickerset.created).toLocaleString()}</div>
		</div>
		<div class="right">
			<Icon img="img/heart-{favorite_icon}.svg" alt={favorite_alt} size="20px" padding="10px" onClick={toggleFavorite} />
		</div>
	</div>
	<div class="set">
		<StickerSetPart {stickerset} items={first} {intersecting} />
	</div>
	{#if !showall}
		<Button img="img/{expanded ? 'up' : 'down'}.svg" onClick={clickExpand} width="100%" />
	{/if}
	{#if showall || expanded}
		<div class="set">
			<StickerSetPart {stickerset} items={rest} {intersecting} />
		</div>
	{/if}
</div>
