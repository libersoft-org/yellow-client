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

 function setCategory(name) {
  expression = name;
 }

 function clickExpression(e) {
  e.stopPropagation();
 }
</script>

<style>
 .expressions {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #fd1;
  width: 420px;
  max-width: 420px;
 }
</style>

<div class="expressions" role="none" on:mousedown={clickExpression}>
 <Item label="Emojis" active={expression === 'emojis'} onClick={() => setCategory('emojis')} />
 <Item label="Stickers" active={expression === 'stickers'} onClick={() => setCategory('stickers')} />
 <Item label="GIFs" active={expression === 'gifs'} onClick={() => setCategory('gifs')} />
</div>
<svelte:component this={expressions[expression]} />
