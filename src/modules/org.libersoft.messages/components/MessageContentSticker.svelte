<script>
 import Sticker from './sticker.svelte';
 import { getContext } from 'svelte';

 let { node } = $props();

 let v = node.attributes.file?.value;
 let openStickersetDetailsModal = getContext('openStickersetDetailsModal');
 //$: console.log('MessageContentSticker node:', v);

 function click() {
  console.log('MessageContentSticker onClick');
  openStickersetDetailsModal(node.attributes.stickerset?.value);
 }
</script>

{#if v}
 <div {click}>
  <Sticker file={v} />
 </div>
{/if}
