<script>
 import { identifier } from '../../messages.js';
 import Button from '@/core/components/Button/Button.svelte';
 import { assembleFile } from '@/org.libersoft.messages/services/Files/utils.ts';
 import Spinner from '@/core/components/Spinner/Spinner.svelte';
 import galleryStore from '../../stores/GalleryStore.ts';
 import Icon from '@/core/components/Icon/Icon.svelte';

 let gallery = galleryStore.store;
 let currentFile = galleryStore.currentFile();
 let currentFilePosition = $derived($gallery.files.indexOf($currentFile) + 1);

 function download() {
  assembleFile($currentFile.url, $currentFile.fileName);
 }

 function close() {
  galleryStore.setShow(false);
 }

 function previous() {
  galleryStore.previous();
 }

 function next() {
  galleryStore.next();
 }

 let canPrevious = galleryStore.canPrevious();
 let canNext = galleryStore.canNext();

 let loading = $state(false);

 function handleKeyboard(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.key === 'Escape') {
   event.preventDefault();
   close();
  } else if (event.key === 'ArrowLeft' && $canPrevious) {
   previous();
  } else if (event.key === 'ArrowRight' && $canNext) {
   next();
  }
 }

 $effect(() => {
  if ($currentFile && !$currentFile.loaded) {
   loading = true;
   $currentFile
    .loadFile()
    .then(loadedFile => {
     galleryStore.updateFile($currentFile.id, {
      loaded: true,
      ...loadedFile,
     });
    })
    .catch(err => {
     console.error('error fetching image data for yellow id:', $currentFile.id, err);
    })
    .finally(() => {
     loading = false;
    });
  }
 });

 $effect(() => {
  const opts = { capture: true };
  if ($gallery.show) {
   document.addEventListener('keydown', handleKeyboard, opts);
  } else {
   document.removeEventListener('keydown', handleKeyboard, opts);
  }
 });

 function onAnywhereClick(event) {
  // very simple background close
  if (event.target === event.currentTarget) {
   close();
  }
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

 .side-control {
  position: absolute;
  top: 0;
  width: 100px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
 }

 .side-control:hover {
  background-color: rgba(0, 0, 0, 0.75);
 }

 .side-prev {
  left: 0;
 }

 .side-next {
  right: 0;
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
  position: relative;
  display: flex;
  overflow: hidden;
  flex-flow: column;
  justify-content: center;
 }

 .image-caption {
  width: 100%;
  text-align: center;
  margin-top: 8px;
  color: #ccc;
 }

 .image img {
  max-width: 100%;
  max-height: 85vh;
 }
</style>

{#if $gallery.show}
 <div class="gallery" onpointerdown={onAnywhereClick}>
  <div class="top-left">
   <Button img="modules/{identifier}/img/download.svg" colorVariable="--icon-black" onClick={download} />
  </div>
  <div class="top-right">
   <Button img="img/close.svg" colorVariable="--icon-black" onClick={close} />
  </div>
  {#key $currentFile.id}
   {#if $currentFile}
    <div class="image">
     {#if !loading}
      <img src={$currentFile.url} alt={$currentFile.fileName} />
     {:else}
      <div>
       <Spinner color="white" />
      </div>
     {/if}
     <div class="image-caption">
      {$currentFile.fileName} ({currentFilePosition} of {$gallery.files.length})
     </div>
    </div>
   {/if}
  {/key}
  <div class="side-control side-prev" style:display={$canPrevious ? undefined : 'none'}>
   <Icon img="img/caret-left.svg" alt="Previous" colorVariable="--icon-white" size="80" onClick={previous} />
  </div>
  <div class="side-control side-next" style:display={$canNext ? undefined : 'none'}>
   <Icon img="img/caret-right.svg" alt="Next" colorVariable="--icon-white" size="80" onClick={next} />
  </div>
 </div>
{/if}
