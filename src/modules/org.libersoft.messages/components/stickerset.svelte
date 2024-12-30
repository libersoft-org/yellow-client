<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 import StickerSetPart from './stickerset-part.svelte';
 import { onMount } from 'svelte';
 import { db } from '../db';

 export let save_height;
 export let intersecting = true;
 export let stickerset = {};
 export let showall = false;
 export let splitAt = 8;
 let first, rest;
 let stickers = [];
 let expanded = false;
 let clientHeight;

 $: save_height(clientHeight);

 $: update(intersecting);

 async function update(intersecting) {
  if (intersecting) {
   stickers = await db.stickers.where('stickerset').equals(stickerset.id).toArray();
  } else stickers = [];
 }

 $: first = stickers.slice(0, splitAt);
 $: rest = stickers.slice(splitAt);

 /*
 $: console.log('library stickerset', stickerset);
 $: console.log('library stickers', stickers);
 $: console.log('library first', first);
 $: console.log('library rest', rest);
*/

 function mousedown(event) {
  //console.log('stickerset mousedown');
  //event.stopPropagation();
 }

 function clickExpand() {
  expanded = !expanded;
  //console.log(stickerset);
 }

 function clickAdd() {
  //console.log('Add to favourites');
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

{#if intersecting}
 {stickerset.id}
 <div class="stickerset" role="none" bind:clientHeight>
  <div class="title-bar">
   <div class="row">
    <div class="label">{stickerset.name}</div>
    <BaseButton onClick={clickAdd}>
     <div class="icon">
      <img src="img/add-black.svg" alt="Add to favourites" />
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
