<script>
 import { loadUploadData, makeDownloadChunkAsyncFn, identifier, downloadAttachmentsSerial } from '../../messages.js';
 import { active_account } from '../../../../core/core.js';
 import { onMount } from 'svelte';
 import MediaHandler from '../../media/Media.handler.ts';
 import { humanSize } from '../../../../core/utils/file.utils.js';
 import MediaUtils from '../../media/Media.utils.ts';
 import Button from '../../../../core/components/button.svelte';
 import { assembleFile } from '../../fileUpload/utils.ts';
 import { writable, get } from 'svelte/store';
 import fileDownloadStore from '../../fileUpload/fileDownloadStore.ts';
 import MessageContentAttachment from '../msgAttachment/message-content-attachment.svelte';

 let { uploadId } = $props();
 let videoRef = null;
 let thumbnailRef = null;
 let mediaHandler = $state(null);
 let upload = $state(null);
 let download = writable(null);
 fileDownloadStore.store.subscribe(() => download.set(fileDownloadStore.get(uploadId) || null));

 function getFileChunkFactory(uploadId) {
  const fn = makeDownloadChunkAsyncFn(get(active_account));
  return params => fn({ uploadId, ...params });
 }

 function onDownload() {
  downloadAttachmentsSerial([upload.record], download => {
   assembleFile(new Blob(download.chunksReceived, { type: download.record.fileMimeType }), download.record.fileOriginalName);
  });
 }

 onMount(() => {
  loadUploadData(uploadId).then(uploadData => {
   upload = uploadData;
   const { record } = uploadData;

   const getFileChunk = getFileChunkFactory(uploadId);
   mediaHandler = new MediaHandler(videoRef, getFileChunk, {
    id: record.id,
    totalSize: record.fileSize,
    fileMime: record.fileMimeType,
    chunkSize: 1024 * 1024 * 1,
   });
   mediaHandler.setupVideo();

   getFileChunk({ offsetBytes: 0, chunkSize: 1024 * 1024 }).then(firstChunk => {
    MediaUtils.extractThumbnail(new Blob([firstChunk.chunk.data], { type: record.fileMimeType })).then(thumbnailBlob => {
     // set thumbnailBlob to img src
     const thumbnailSrc = URL.createObjectURL(thumbnailBlob);
     mediaHandler.player.poster(thumbnailSrc);
    });
   });
  });
 });
</script>

<style>
 .video-wrapper {
  width: 280px;
  margin-bottom: 8px;
 }

 .video {
  width: 100%;
  height: 240px;
 }

 .video-title {
  margin-bottom: 8px;
 }

 .content {
  margin-bottom: 20px;
 }
</style>

<div>
 <div class="video-title">
  {#if upload}
   <div>
    <strong>{upload.record.fileOriginalName}</strong> ({humanSize(upload.record.fileSize)})
   </div>
  {:else}
   Loading...
  {/if}
 </div>
 <div class="video-wrapper">
  <video bind:this={videoRef} class="video video-js vjs-default-skin" controls> </video>
 </div>
 {#if !$download}
  <div class="">
   <Button img="modules/{identifier}/img/download.svg" onClick={onDownload}>Download</Button>
  </div>
 {:else}
  <MessageContentAttachment node={{ attributes: { id: { value: uploadId } } }} />
 {/if}
</div>
