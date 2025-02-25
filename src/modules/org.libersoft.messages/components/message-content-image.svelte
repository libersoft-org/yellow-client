<script>
 import { onDestroy, onMount } from "svelte";
 import filesService from "../fileUpload/Files.service.ts";
 import ImageAspectRatio from "./image-aspect-ratio.svelte";
 import MessageContentAttachment from "./message-content-attachment.svelte";
 import { galleryFile, showGallery } from "../messages.js";
 import { LocalFileStatus } from "../localDB/files.localDB.ts";
 import { liveQuery } from "dexie";
 import Spinner from "../../../core/components/spinner.svelte";
 import { writable } from "svelte/store";
 import fileDownloadStore from "../fileUpload/fileDownloadStore.ts";
 import { FileUploadRecordStatus } from "../fileUpload/types.ts";
 import fileUploadStore from "../fileUpload/fileUploadStore.ts";

 let { node } = $props();
 let file = node.attributes.file?.value;

 const YELLOW_SRC_PROTOCOL = 'yellow:';
 // check str if begins with yellow
 let isYellow = $derived(file && file.startsWith(YELLOW_SRC_PROTOCOL)) // todo: check deep prop reactivity (in case of message edit)
 let yellowId = $derived(isYellow ? file.slice(YELLOW_SRC_PROTOCOL.length) : null)
 let loading = $state(false);
 let loaded = $state(false);
 let imgUrl = $state(null);
 let imgFileName = $state(null);
 const upload = writable(null);
 fileUploadStore.store.subscribe(() => upload.set(fileUploadStore.get(yellowId) || null));


 function showFullSize() {
  showGallery.set(true);
  galleryFile.set({
   url: imgUrl,
   fileName: imgFileName
  });
 }

 function downloadImage() {
  if (loaded) {
   return;
  }
  loading = true;
  console.log('starting to fetch image data for yellow id:', yellowId);
  filesService.getOrDownloadAttachment(yellowId)
   .then(({localFile}) => {
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
   downloadImage()
  }
 });

 onMount(() => {
  console.log('on mount download', $upload);
  if (isYellow && !$upload) {
   downloadImage()
  }
 })

 onDestroy(() => {
  console.log('DESTROYYYYYYYY');
 })
</script>

<style>
 .message-content-image :global(img) {
  border-radius: 4px;
 }

 .message-content-image:hover {
  opacity: 0.8;
  cursor: pointer;
 }

 .spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: #ccc;
  opacity: .3;
  border-radius: 4px;
 }
</style>

<div class="message-content-image-wrapper">
 {#if isYellow}
  {#if $upload && $upload?.record.status !== FileUploadRecordStatus.FINISHED}
   <MessageContentAttachment node={{attributes:{id:{value: yellowId}}}} />
  {:else}
   <div class="message-content-image" onclick={showFullSize}>
    {#if loading}
     <div class="spinner-wrap">
      <Spinner show={true} />
     </div>
    {:else}
     <ImageAspectRatio src={imgUrl} alt={file} />
    {/if}
   </div>
  {/if}
 {:else}
  basic image here
 {/if}
</div>
