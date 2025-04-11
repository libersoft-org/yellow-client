<script>
 import { onMount } from 'svelte';
 import filesService from '@/org.libersoft.messages/services/Files/FilesService.ts';
 import ImageAspectRatio from '@/core/components/ImageAspectRatio/ImageAspectRatio.svelte';
 import MessageContentAttachment from '@/org.libersoft.messages/components/MessageContentFile/MessageContentAttachment.svelte';
 import { LocalFileStatus } from '@/org.libersoft.messages/services/LocalDB/FilesLocalDB.ts';
 import Spinner from '../../../../core/components/Spinner/Spinner.svelte';
 import { writable } from 'svelte/store';
 import { FileUploadRecordStatus } from '@/org.libersoft.messages/services/Files/types.ts';
 import fileUploadStore from '@/org.libersoft.messages/stores/FileUploadStore.ts';
 import galleryStore from '../../stores/GalleryStore.ts';

 let { node, showHiddenImages, hiddenImages, siblings } = $props();
 let file = node.attributes.file?.value;

 const YELLOW_SRC_PROTOCOL = 'yellow:';
 // check str if begins with yellow
 let isYellow = $derived(file && file.startsWith(YELLOW_SRC_PROTOCOL)); // todo: check deep prop reactivity (in case of message edit)
 let yellowId = $derived(isYellow ? file.slice(YELLOW_SRC_PROTOCOL.length) : null);
 let loading = $state(false);
 let loaded = $state(false);
 let imgUrl = $state(null);
 let imgFileName = $state(null);
 const upload = writable(null);
 fileUploadStore.store.subscribe(() => upload.set(fileUploadStore.get(yellowId) || null));

 function makeFilesForGallery() {
  const filesForGallery = [];
  for (let index = 0; index < siblings.length; index++) {
   const siblingNode = siblings[index];
   const fileAttr = siblingNode?.props?.file;
   const siblingYellowId = fileAttr && fileAttr.startsWith(YELLOW_SRC_PROTOCOL) ? fileAttr.slice(YELLOW_SRC_PROTOCOL.length) : null;

   if (!siblingYellowId) {
    continue;
   }

   if (siblingYellowId === yellowId) {
    filesForGallery.push({
     id: yellowId,
     loaded: true,
     url: imgUrl,
     fileName: imgFileName,
    });
   } else {
    filesForGallery.push({
     id: siblingYellowId,
     loaded: false,
     loadFile: () =>
      new Promise((resolve, reject) => {
       filesService
        .getOrDownloadAttachment(siblingYellowId)
        .then(({ localFile }) => {
         if (localFile.localFileStatus === LocalFileStatus.READY && localFile.fileBlob) {
          const galleryFile = {
           id: siblingYellowId,
           url: URL.createObjectURL(localFile.fileBlob),
           fileName: localFile.fileOriginalName,
           loading: false,
           loaded: true,
          };
          resolve(galleryFile);
         }
        })
        .catch(err => {
         reject(err);
        });
      }),
    });
   }
  }
  return filesForGallery;
 }

 function openInGallery() {
  galleryStore.setFiles(makeFilesForGallery());
  galleryStore.setShow(true);
  galleryStore.setCurrentId(yellowId);
 }

 function downloadImage() {
  if (loaded) {
   return;
  }
  loading = true;

  filesService
   .getOrDownloadAttachment(yellowId)
   .then(({ localFile }) => {
    if (localFile.localFileStatus === LocalFileStatus.READY) {
     imgUrl = URL.createObjectURL(localFile.fileBlob);
     imgFileName = localFile.fileOriginalName;
     loading = false;
     loaded = true;
    }
   })
   .catch(err => {
    console.error('error fetching image data for yellow id:', yellowId, err);
   });
 }

 $effect(() => {
  if (isYellow && $upload && $upload.record.status === FileUploadRecordStatus.FINISHED) {
   downloadImage();
  }
 });

 onMount(() => {
  if (isYellow && !$upload) {
   downloadImage();
  }
 });
</script>

<style>
 .message-content-image-wrapper {
  --border-radius: 4px;
  position: relative;
 }

 .message-content-image :global(img) {
  border-radius: var(--border-radius);
 }

 .message-content-image:hover {
  opacity: 0.8;
  cursor: pointer;
 }

 .spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--image-size);
  height: var(--image-size);
  background: #ccc;
  opacity: 0.3;
  border-radius: 4px;
 }

 .hidden-images {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  z-index: 1;
  border-radius: var(--border-radius);
 }
</style>

<div class="message-content-image-wrapper">
 {#if isYellow}
  {#if $upload && $upload?.record.status !== FileUploadRecordStatus.FINISHED}
   <MessageContentAttachment node={{ attributes: { id: { value: yellowId } } }} />
  {:else}
   <div class="message-content-image" onclick={openInGallery} role="button" tabindex="0" onkeydown={e => e.key === 'Enter' && openInGallery()}>
    {#if loading}
     <div class="spinner-wrap">
      <Spinner show={true} style="min-height: initial;" />
     </div>
    {:else}
     <ImageAspectRatio src={imgUrl} alt={file} />
     {#if showHiddenImages}
      <div class="hidden-images">
       +{hiddenImages.length}
      </div>
     {/if}
    {/if}
   </div>
  {/if}
 {:else}
  basic image here
 {/if}
</div>
