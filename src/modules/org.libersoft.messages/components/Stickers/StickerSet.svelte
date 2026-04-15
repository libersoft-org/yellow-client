<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { add_stickerset_to_favorites, remove_stickerset_from_favorites, stickerset_in_favorites, stickerset_favorites } from '@/org.libersoft.messages/scripts/stickers.ts';
	import { debug } from '@/core/scripts/stores.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import StickerSetPart from '@/org.libersoft.messages/components/Stickers/StickerSetPart.svelte';
	import { stickers_db } from '@/org.libersoft.messages/scripts/db.ts';
	interface Props {
		intersecting?: boolean;
		stickerset?: any;
		showall?: boolean;
	}
	let { intersecting = true, stickerset = {}, showall = false }: Props = $props();
	let splitAt = 8;
	/*
	 TODO: stickers-search-results constructs Stickerset with stickerset parameter, which contains the metadata, but not items.
	 Items are fetched from the database by update here. But the other case is when Stickerset is a child of stickerset-details-svelte. In that case,
	 the items are passed in the stickerset object. So, we need to check if the items are already there, and if not, fetch them from the database.
	*/
	let stickers: any[] | undefined = $state(undefined);
	let expanded = $state(false);
	// @ts-expect-error TS6133 - used in template bind:clientHeight
	let _clientHeight = $state(0);
	let in_favorites = $state(false);
	let _update = $derived.by((): boolean => {
		const inter = intersecting;
		queueMicrotask(() => update(inter));
		return true;
	});
	let first = $derived(showall ? stickers : (stickers as any[] | undefined)?.slice(0, splitAt));
	let rest = $derived(showall ? [] : (stickers as any[] | undefined)?.slice(splitAt));
	stickerset_favorites.subscribe((_value: any) => (in_favorites = stickerset_in_favorites(stickerset)));
	let favorite_alt = $derived(in_favorites ? 'Remove from favorites' : 'Add to favorites');
	let favorite_icon = $derived(in_favorites ? 'full' : 'empty');

	onMount(() => {
		//console.log(`stickerset ${stickerset.id} mounted, intersecting: ${intersecting}`);
	});

	onDestroy(() => {
		//console.log(`stickerset ${stickerset.id} destroyed`);
	});

	async function update(intersecting: boolean): Promise<void> {
		//console.log(`stickerset ${stickerset.id} intersecting: ${intersecting}`);
		if (intersecting) {
			if (stickers === undefined) {
				//console.log('stickerset', stickerset);
				if (stickerset.items) stickers = stickerset.items;
				else stickers = await stickers_db.stickers.where('stickerset').equals(stickerset.id).toArray();
			}
		}
	}

	function clickExpand(): void {
		expanded = !expanded;
	}

	function toggleFavorite(): void {
		if (stickerset_in_favorites(stickerset)) remove_stickerset_from_favorites(stickerset);
		else add_stickerset_to_favorites(stickerset);
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
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
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

<div class="stickerset" data-stickers-update={_update || undefined} style="content-visibility: {intersecting ? 'visible' : 'hidden'}" role="none" bind:clientHeight={_clientHeight}>
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
		<StickerSetPart {stickerset} items={first ?? []} {intersecting} />
	</div>
	{#if !showall}
		<Button img="img/{expanded ? 'up' : 'down'}.svg" onClick={clickExpand} />
	{/if}
	{#if showall || expanded}
		<div class="set">
			<StickerSetPart {stickerset} items={rest ?? []} {intersecting} />
		</div>
	{/if}
</div>
