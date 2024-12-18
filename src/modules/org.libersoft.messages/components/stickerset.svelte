<script>
 import StickerSetPart from './stickerset-part.svelte';

 export let stickerset = {};

 let stickers;
 $: stickers = stickerset.items || [];
 let first, rest;
 let split_at = 66666;
 $: first = stickers.slice(0, split_at);
 $: rest = stickers.slice(split_at);

 function mousedown(event) {
  console.log('stickerset mousedown');
  event.stopPropagation();
 }
</script>

<style>
 .stickerset {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  max-width: 420px; /* TODO: if I delete this, then max-width is ignored in expressions.svelte (same size set there)*/
 }

 .stickerset .label {
  font-weight: bold;
 }

 .stickerset .set {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
 }
</style>

<div class="stickerset" role="none" on:mousedown={mousedown}>
 <div class="label">{stickerset.name}</div>
 <div class="set">
  <StickerSetPart items={first} />

  <!--
   {#each rest as s}
    <Item file={s.url} autoplay={false} />
   {/each}
-->
 </div>
</div>
