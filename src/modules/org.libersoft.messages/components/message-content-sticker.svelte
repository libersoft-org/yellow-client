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
  if (stickerset) {
   openStickersetDetailsModal(stickerset);
  }
 }
</script>

{#if v}
 <BaseButton onClick={handleClick}>
  <Sticker file={v} />
 </BaseButton>
{/if}
