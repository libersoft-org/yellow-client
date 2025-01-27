<script>
 import Emojis from './emojis.svelte';
 import Stickers from './stickers.svelte';
 import GifSet from './gifset.svelte';
 import Item from './expressions-item.svelte';
 export let height;
 let expression = 'emojis';
 const expressions = {
  emojis: Emojis,
  stickers: Stickers,
  gifs: GifSet,
 };

 function setCategory(e, name) {
  expression = name;
  e.stopPropagation();
  e.preventDefault();
 }
</script>

<style>
 .expressions {
  overflow: hidden;
 }

 .categories {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fd1;
  height: 45px;
  max-height: 45px;
 }
</style>

<div class="expressions" style="height: {height}">
 <div class="categories" role="none">
  <Item label="Emojis" active={expression === 'emojis'} onClick={e => setCategory(e, 'emojis')} />
  <Item label="Stickers" active={expression === 'stickers'} onClick={e => setCategory(e, 'stickers')} />
  <Item label="GIFs" active={expression === 'gifs'} onClick={e => setCategory(e, 'gifs')} />
 </div>
 <svelte:component this={expressions[expression]} />
</div>
