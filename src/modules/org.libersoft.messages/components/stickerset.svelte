<script>
 import StickerSetPart from './stickerset-part.svelte';

 export let stickerset = {};

 let stickers;
 $: stickers = stickerset.items || [];
 let first, rest;
 let split_at = 8;
 $: first = stickers.slice(0, split_at);
 $: rest = stickers.slice(split_at);
 let expanded = false;

 function mousedown(event) {
  console.log('stickerset mousedown');
  event.stopPropagation();
 }

 function clickExpand() {
  expanded = !expanded;
 }

 function keyExpand(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickExpand();
  }
 }

 function clickAdd() {
  console.log('Add to favourites');
 }

 function keyAdd(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickAdd();
  }
 }
</script>

<style>
 .stickerset {
  display: flex;
  flex-direction: column;
  gap: 5px;
 }

 .name-bar {
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 10px;
  background-color: #ddd;
 }

 .name-bar .label {
  font-weight: bold;
  flex-grow: 1;
  padding: 0 5px;
 }

 .name-bar .icon {
  padding: 5px;
  cursor: pointer;
 }

 .name-bar img {
  display: flex;
  width: 20px;
  height: 20px;
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
 <div class="name-bar">
  <div class="label">{stickerset.name}</div>
  <div class="icon" role="button" tabindex="0" on:click={clickAdd} on:keydown={keyAdd}>
   <img src="img/add-black.svg" alt="Add to favourites" />
  </div>
 </div>
 <div class="set">
  <StickerSetPart items={first} />
 </div>
 {#if stickers.length > split_at}{/if}
 {#if expanded}
  <div class="set">
   <StickerSetPart items={rest} />
  </div>
 {/if}
 <div class="more" role="button" tabindex="0" on:click={clickExpand} on:keydown={keyExpand}>
  <img src="img/{expanded ? 'up' : 'down'}-black.svg" alt={expanded ? '▲' : '▼'} />
 </div>
</div>
