<script>
 import { identifier, showGallery, galleryFile } from '../messages.js';
 import BaseButton from '../../../core/components/base-button.svelte';
 import Button from '../../../core/components/button.svelte';
 export let file;

 function showFullSize() {
  showGallery.set(true);
  galleryFile.set(file);
 }

 function download() {
  console.log('Download image');
 }
</script>

<style>
 .image-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .image {
  display: flex;
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 .image img {
  max-width: 640px;
  max-height: 640px;
 }
</style>

{#if file}
 <div class="image-wrap">
  <BaseButton onClick={showFullSize}>
   <div class="image"><img src={file} alt={file} /></div>
  </BaseButton>
  <Button img="modules/{identifier}/img/download.svg" text="Download" onClick={download} />
 </div>
{/if}
