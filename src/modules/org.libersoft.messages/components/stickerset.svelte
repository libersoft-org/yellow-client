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
</script>

<style>
 .stickerset {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /*max-width: 420px;*/ /* TODO: if I delete this, then max-width is ignored in expressions.svelte (same size set there)*/
  /*max-width: 1020px;*/
 }

 .label {
  font-weight: bold;
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
  background-color: #ddd;
  cursor: pointer;
 }

 .more img {
  width: 20px;
  height: 20px;
 }
</style>

<div class="stickerset" role="none" on:mousedown={mousedown}>
 <div class="label">{stickerset.name}</div>
 <div class="set">
  <StickerSetPart items={first} />
 </div>
 {#if stickers.length > split_at}
  <div class="more" role="button" tabindex="0" on:click={clickExpand} on:keydown={keyExpand}><img src="img/{expanded ? 'up' : 'down'}-black.svg" alt={expanded ? '▲' : '▼'} /></div>
 {/if}
 {#if expanded}
  <div class="set">
   <StickerSetPart items={rest} />
  </div>
 {/if}
</div>
