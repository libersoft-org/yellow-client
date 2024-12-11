<script>
 import EmojiSet from './emojiset.svelte';
 import StickerSet from './stickerset.svelte';
 import GifSet from './gifset.svelte';
 import Item from './expressions-item.svelte';
 let expression = 'stickers';
 const expressions = {
  emojis: EmojiSet,
  stickers: StickerSet,
  gifs: GifSet,
 };

 function setCategory(e, name) {
  expression = name;
  e.stopPropagation();
  e.preventDefault();
 }

 function mousedown(e) {
  e.stopPropagation();
  e.preventDefault();
 }

 function click(e) {
  e.stopPropagation();
  e.preventDefault();
 }
</script>

<style>
 .expressions {
  display: flex;
  justify-content: space-between;
  background-color: #fd1;
  width: 440px;
  max-width: 440px;
 }
</style>

<div class="expressions" role="none" on:mousedown={mousedown} on:click={click}>
 <Item label="Emojis" active={expression === 'emojis'} onClick={e => setCategory(e, 'emojis')} />
 <Item label="Stickers" active={expression === 'stickers'} onClick={e => setCategory(e, 'stickers')} />
 <Item label="GIFs" active={expression === 'gifs'} onClick={e => setCategory(e, 'gifs')} />
</div>
<svelte:component this={expressions[expression]} />
