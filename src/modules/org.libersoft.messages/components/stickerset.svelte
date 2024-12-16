<script>
 import Item from './stickerset-item.svelte';

 export let stickerset = {};

 let stickers;
 $: stickers = stickerset.items || [];
 let first, rest;
 $: first = stickers.slice(0, 6);
 $: rest = stickers.slice(6);

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

 <details>
  <summary>
   <div class="set">
    {#each first as s}
     <i>{JSON.stringify(s.id)}</i>
     <Item file={s.url} />
    {/each}
   </div>
  </summary>

  <div class="set">
   {#each rest as s}
    <Item file={s} />
   {/each}
  </div>
 </details>
</div>
