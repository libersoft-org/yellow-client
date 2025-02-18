<script>
 import { identifier } from '../messages.js';
 import Emojis from './emojis.svelte';
 import Stickers from './stickers.svelte';
 import GifSet from './gifset.svelte';
 import Item from './expressions-item.svelte';
 import Settings from './expressions-settings.svelte';
 import { onMount, tick } from 'svelte';
 export let height;

 let expression = 'emojis';
 let elExpression;

 const expressions = {
  emojis: Emojis,
  stickers: Stickers,
  gifs: GifSet,
  settings: Settings,
 };

 async function setCategory(e, name) {
  expression = name;
  e.stopPropagation();
  e.preventDefault();
  await currentTabOnShow();
 }

 onMount(async () => {
  await currentTabOnShow();
 });

 async function currentTabOnShow() {
  await tick();
  console.log('currentTabOnShow:', expression);
  elExpression?.onShow?.();
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
  <Item label="Emojis" icon={'modules/' + identifier + '/img/emoji-black.svg'} active={expression === 'emojis'} onClick={e => setCategory(e, 'emojis')} />
  <Item label="Stickers" icon={'modules/' + identifier + '/img/sticker-black.svg'} active={expression === 'stickers'} onClick={e => setCategory(e, 'stickers')} />
  <Item label="GIFs" icon={'modules/' + identifier + '/img/gif-black.svg'} active={expression === 'gifs'} onClick={e => setCategory(e, 'gifs')} />
  <Item label="Settings" icon={'modules/' + identifier + '/img/settings-black.svg'} active={expression === 'settings'} onClick={e => setCategory(e, 'settings')} />
 </div>
 <svelte:component this={expressions[expression]} bind:this={elExpression} />
</div>
