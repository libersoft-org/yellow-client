<script>
 import BaseButton from '../../../core/components/base-button.svelte';
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
</script>

<style>
 .clickable {
  cursor: pointer;
 }
</style>

{#if v}
 <BaseButton onClick={handleClick}>
  <div class={stickerset ? 'clickable' : ''}>
   <Sticker file={v} />
  </div>
 </BaseButton>
{/if}
