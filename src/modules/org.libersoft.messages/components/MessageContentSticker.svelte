<script>
 import Sticker from './sticker.svelte';
 import { getContext } from 'svelte';

 let { node } = $props();

 let v = node.attributes.file?.value;
 const stickerset = $derived(node.attributes.set?.value);

 let openStickersetDetailsModal = getContext('openStickersetDetailsModal');
 //$: console.log('MessageContentSticker node:', v);

 function onclick() {
  //console.log('MessageContentSticker onClick' + JSON.stringify(node.attributes.stickerset?.value));
  openStickersetDetailsModal(stickerset);
 }
</script>

<style>
 .clickable {
  cursor: pointer;
 }
</style>

{#if v}
 <div class={stickerset ? 'clickable' : ''} {onclick}>
  <Sticker file={v} />
 </div>
{/if}
