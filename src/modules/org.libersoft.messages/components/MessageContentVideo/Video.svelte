<script lang="ts">
 import { loadUploadData, makeDownloadChunkAsyncFn, identifier, downloadAttachmentsSerial } from '../../messages.js';
 import { active_account } from '../../../../core/core.js';
 import { onMount } from 'svelte';
 import MediaService from '@/org.libersoft.messages/services/Media/MediaService.ts';
 import { humanSize } from '../../../../core/utils/fileUtils.js';
 import MediaUtils from '@/org.libersoft.messages/services/Media/MediaUtils.ts';
 import Button from '@/core/components/Button/Button.svelte';
 import { assembleFile } from '@/org.libersoft.messages/services/Files/utils.ts';
 import { writable, get } from 'svelte/store';
 import fileDownloadStore from '@/org.libersoft.messages/stores/FileDownloadStore.ts';
 import MessageContentAttachment from '@/org.libersoft.messages/components/MessageContentFile/MessageContentAttachment.svelte';
 import type { FileUpload, FileUploadRecord } from "@/org.libersoft.messages/services/Files/types.ts";

 let { uploadId } = $props();
 let videoRef = null;
 let thumbnailRef = null;
 let mediaHandler = $state<MediaService | null>(null);
 let upload = $state<FileUpload | null>(null);
 let download = writable(null);
 fileDownloadStore.store.subscribe(() => download.set(fileDownloadStore.get(uploadId) || null));
 let acc = $derived(get(active_account))

 function getFileChunkFactory(uploadId) {
  const fn = makeDownloadChunkAsyncFn(get(active_account));
  return params => fn({ uploadId, ...params });
 }

 function onDownload() {
  downloadAttachmentsSerial([upload.record], download => {
   const blob = new Blob(download.chunksReceived, { type: download.record.fileMimeType })
   assembleFile(blob, download.record.fileOriginalName);
  });
 }

 onMount(() => {
  console.log('dasdas acc', acc);
  loadUploadData(uploadId).then(uploadData => {
   upload = uploadData;
   const { record } = uploadData;
   const getFileChunk = getFileChunkFactory(uploadId);
   // mediaHandler = new MediaService(videoRef, getFileChunk, {
   //  id: record.id,
   //  totalSize: record.fileSize,
   //  fileMime: record.fileMimeType,
   //  chunkSize: 1024 * 1024 * 1,
   // });
   // mediaHandler.setupVideo();

   // getFileChunk({ offsetBytes: 0, chunkSize: 1024 * 1024 }).then(firstChunk => {
   //  MediaUtils.extractThumbnail(new Blob([firstChunk.chunk.data], { type: record.fileMimeType })).then(thumbnailBlob => {
   //   // set thumbnailBlob to img src
   //   const thumbnailSrc = URL.createObjectURL(thumbnailBlob);
   //   mediaHandler.player.poster(thumbnailSrc);
   //   mediaHandler.player.width(140);
   //   mediaHandler.player.height(280);
   //   console.log('settting!"!');
   //  });
   // });
  });
 });
</script>

<style>
 .video-wrapper {
  max-width: min(330px, var(--video-size));
  width: 100%;
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
  <!--<video bind:this={videoRef} onclick={() => console.log('test')} class="video video-js vjs-default-skin" controls> </video>-->
  <!--<video src="https://dl11.webmfiles.org/big-buck-bunny_trailer.webm" class="video video-js vjs-default-skin" controls> </video>-->
  {#if upload}
   <video src="/yellow/media/{acc.id}/{upload.record.id}" class="video video-js vjs-default-skin" controls> </video>
  {/if}
 </div>
 <button onclick={() => mediaHandler.player.play()} class="btn btn-primary">Play</button>
 {#if !$download}
  <div class="">
   <Button img="modules/{identifier}/img/download.svg" onClick={onDownload}>Download</Button>
  </div>
 {:else}
  <MessageContentAttachment node={{ attributes: { id: { value: uploadId } } }} />
 {/if}
</div>
