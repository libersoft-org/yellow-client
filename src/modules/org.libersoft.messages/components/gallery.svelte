<script>
 import { identifier, showGallery, galleryFile } from '../messages.js';
 import BaseButton from '../../../core/components/base-button.svelte';
 import Button from '../../../core/components/button.svelte';

 function download() {
  console.log('Clicked download');
 }

 function close() {
  showGallery.set(false);
 }
</script>

<style>
 .gallery {
  z-index: 9999;
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0, 0, 0, 0.9);
 }

 .top-left {
  top: 0;
  left: 0;
 }

 .top-right {
  top: 0;
  right: 0;
 }

 .top-left,
 .top-right {
  z-index: 10000;
  position: absolute;
  padding: 10px;
  background-color: #000;
 }

 .image {
  display: flex;
  overflow: hidden;
 }

 .image img {
  max-width: 100%;
  max-height: 100%;
 }
</style>

{#if $showGallery}
 <div class="gallery">
  {#if $galleryFile}
   <BaseButton onClick={close}>
    <div class="image"><img src={$galleryFile} alt={$galleryFile} /></div>
   </BaseButton>
  {/if}
  <div class="top-left">
   <Button img="modules/{identifier}/img/download.svg" onClick={download} />
  </div>
  <div class="top-right">
   <Button img="img/close-black.svg" onClick={close} />
  </div>
 </div>
{/if}
