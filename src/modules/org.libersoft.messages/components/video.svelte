<script>
 import { loadUploadData, makeDownloadChunkAsyncFn } from '../messages.js';
 import { get } from 'svelte/store';
 import { active_account } from '../../../core/core.js';
 import { onMount } from 'svelte';
 import MediaHandler from '../media/Media.handler.ts';
 import { humanSize } from '../../../core/utils/file.utils.js';
 import MediaUtils from "../media/Media.utils.ts";

 let { uploadId } = $props();
 let videoRef = null;
 let thumbnailRef = null;
 let mediaHandler = $state(null);
 let upload = $state(null);

 function getFileChunkFactory(uploadId) {
  const fn = makeDownloadChunkAsyncFn(get(active_account));
  return params => fn({ uploadId, ...params });
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
  height: calc(280px / 4 * 3); /* todo: better styles (note: keep dimensions) */
 }

 .video {
  width: 100%;
  height: 240px;
 }

 .video-title {
  margin-bottom: 8px;
 }
</style>

<div class="video-wrapper">
 <div class="video-title">
  {#if upload}
   <div>
    <strong>{upload.record.fileOriginalName}</strong> ({humanSize(upload.record.fileSize)})
   </div>
  {:else}
   Loading...
  {/if}
 </div>
 <video bind:this={videoRef} class="video video-js vjs-default-skin" controls>
  <!--<source src={srcTest} />-->
 </video>
</div>
