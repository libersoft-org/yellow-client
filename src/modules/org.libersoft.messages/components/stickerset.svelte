<script>
 import { add_stickerset_to_favorites, remove_stickerset_from_favorites, stickerset_in_favorites, stickerset_favorites } from '../stickers.js';
 import { debug } from '../../../core/core.js';
 import BaseButton from '../../../core/components/base-button.svelte';
 import StickerSetPart from './stickerset-part.svelte';
 import { db } from '../db.js';
 export let save_height;
 export let intersecting = true;
 export let stickerset = {};
 export let showall = false;
 let splitAt = 8;
 let stickers = undefined;
 void `stickers-search-results constructs Stickerset with stickerset parameter, which contains the metadata, but not items.
 Items are fetched from the database by update here. But the other case is when Stickerset is a child of stickerset-details-svelte. In that case,
 the items are passed in the stickerset object. So, we need to check if the items are already there, and if not, fetch them from the database.`;
 let first, rest;
 let expanded = false;
 let clientHeight;
 let in_favorites = false;
 $: save_height?.(clientHeight);
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

 async function update(intersecting) {
  if (intersecting) {
   if (stickers === undefined) {
    //console.log('stickerset', stickerset);
    if (stickerset.items) stickers = stickerset.items;
    else stickers = await db.stickers.where('stickerset').equals(stickerset.id).toArray();
   }
  } else stickers = undefined;
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
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  border-radius: 10px;
  background-color: #ddd;
 }

 .title-bar .row {
  display: flex;
 }

 .title-bar .row .label {
  font-weight: bold;
  flex-grow: 1;
 }

 .title-bar .row img {
  display: flex;
  width: 20px;
  height: 20px;
 }

 .title-bar .created {
  font-size: 12px;
 }

 .set {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
 }

 .more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background-color: #fd1;
 }

 .more img {
  width: 20px;
  height: 20px;
 }
</style>

{#if $debug}<details><summary>stickerset</summary>{JSON.stringify(stickerset, null, 2)}</details>{/if}
{#if intersecting}
 <div class="stickerset" role="none" bind:clientHeight>
  <div class="title-bar">
   <div class="row">
    <div class="label">{stickerset.name}</div>
    <BaseButton onClick={toggleFavorite}>
     <div class="icon">
      <img src="img/heart-{favorite_icon}.svg" alt={favorite_alt} />
     </div>
    </BaseButton>
   </div>
   <div class="created">Added: {new Date(stickerset.created).toLocaleString()}</div>
  </div>
  <div class="set">
   <StickerSetPart {stickerset} items={first} />
  </div>
  {#if !showall}
   <BaseButton onClick={clickExpand}>
    <div class="more">
     <img src="img/{expanded ? 'up' : 'down'}-black.svg" alt={expanded ? '▲' : '▼'} />
    </div>
   </BaseButton>
  {/if}
  {#if showall || expanded}
   <div class="set">
    <StickerSetPart {stickerset} items={rest} />
   </div>
  {/if}
 </div>
{/if}
