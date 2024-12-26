<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 import StickerSetPart from './stickerset-part.svelte';
 export let stickerset = {};
 export let showall = false;
 export let splitAt = 8;
 let first, rest;
 let stickers;
 let expanded = false;

 $: stickers = stickerset.items || [];
 $: first = stickers.slice(0, splitAt);
 $: rest = stickers.slice(splitAt);

 function mousedown(event) {
  console.log('stickerset mousedown');
  event.stopPropagation();
 }

 function clickExpand() {
  expanded = !expanded;
  console.log(stickerset);
 }

 function clickAdd() {
  console.log('Add to favourites');
 }
</script>

<style>
 .stickerset {
  display: flex;
  flex-direction: column;
  gap: 5px;
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

 .title-bar .row .icon {
  cursor: pointer;
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
  cursor: pointer;
 }

 .more img {
  width: 20px;
  height: 20px;
 }
</style>

<div class="stickerset" role="none" on:mousedown={mousedown}>
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
  <StickerSetPart items={first} />
 </div>
 {#if stickers.length > splitAt}{/if}
 {#if showall || expanded}
  <div class="set">
   <StickerSetPart items={rest} />
  </div>
 {/if}
 {#if !showall}
  <BaseButton onClick={clickExpand}>
   <div class="more">
    <img src="img/{expanded ? 'up' : 'down'}-black.svg" alt={expanded ? '▲' : '▼'} />
   </div>
  </BaseButton>
 {/if}
</div>
