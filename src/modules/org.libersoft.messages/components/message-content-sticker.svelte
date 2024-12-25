<script>
 import Sticker from './sticker.svelte';
 import { getContext } from 'svelte';
 let { node } = $props();
 let v = node.attributes.file?.value;
 const stickerset = $derived(node.attributes.set?.value);
 let openStickersetDetailsModal = getContext('openStickersetDetailsModal');
 //$: console.log('MessageContentSticker node:', v);

 function handleClick() {
  //console.log('MessageContentSticker handleClick' + JSON.stringify(node.attributes.stickerset?.value));
  openStickersetDetailsModal(stickerset);
 }

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   handleClick();
  }
 }
</script>

<style>
 .clickable {
  cursor: pointer;
 }
</style>

{#if v}
 <div class={stickerset ? 'clickable' : ''} role="button" tabindex="0" onclick={handleClick} onkeydown={handleKeydown}>
  <Sticker file={v} />
 </div>
{/if}
