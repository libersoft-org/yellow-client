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
 import type { FileDownload, FileUpload, FileUploadRecord } from "@/org.libersoft.messages/services/Files/types.ts";
 import { truncateText } from "@/core/utils/textUtils.js";
 import _debug from 'debug';
 import Spinner from "@/core/components/Spinner/Spinner.svelte";
 import VideoView from "@/org.libersoft.messages/components/MessageContentVideo/VideoView.svelte";
 import videoJS from "video.js";

 const debug = _debug('libersoft:messages:components:MessageContentVideo:Video');

 let { uploadId } = $props();
 let videoRef = $state<HTMLVideoElement | null>(null);
 let thumbnailRef = null;
 let mediaHandler = $state<MediaService | null>(null);
 let upload = $state<FileUpload | null>(null);
 let download = $state<FileDownload | null>(null);
 fileDownloadStore.store.subscribe(() => download = fileDownloadStore.get(uploadId) || null);

 let acc = $derived(get(active_account))
 let thumbnailSrc = $state<string | null>(null);

 let videoUrl = $state<string | null>(null)

 let videoJSEnabled = true;
 let posterError = $state(false);
 let videoStarted = $state(false);
 let videoStarting = $state(false);
 let loadingData = $state(false);
 let fetchingPoster = $state(false);
 let videoIsFullDownloading = $state(false);
 let videoJsInstance = $state<ReturnType<typeof videoJS> | null>(null);

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

 async function startVideo() {
  debug('Starting video');
  if (!upload) {
   debug('No upload data available');
   return;
  }

  videoStarting = true;
  const acc = get(active_account);
  const progressiveUrl = MediaUtils.makeProgressiveDownloadUrl(acc.id, upload.record.id);
  debug('Progressive URL:', progressiveUrl);

  const progressiveDownloadAvailable = await MediaUtils.checkProgressiveDownloadAvailability(progressiveUrl)
  debug('Progressive download availability:', progressiveDownloadAvailable);

  if (progressiveDownloadAvailable) {
   videoUrl = progressiveUrl;
   videoStarting = false;
   videoStarted = true;
  }
 }

 $effect(() => {
  if (videoRef && !videoJsInstance && videoUrl && upload) {
   videoRef.src = videoUrl;

   const startVideoJS = () => {
    return videoJS(videoRef, {
     controls: true,
     autoplay: true,
     preload: 'none',
     seekable: false,
     //width: 100,
     // height: 200,
     //fluid: true,
     // sources: [
     //  {
     //   src: videoUrl,
     //   type: upload.record.fileMimeType,
     //  },
     // ],
    });
   }

   if (videoJSEnabled) {
    videoJsInstance = startVideoJS()

    videoJsInstance.on('error', () => {
     console.error('Video.js error:', videoJsInstance.error());

     videoIsFullDownloading = true;
     videoJsInstance.dispose();
     downloadAttachmentsSerial([upload.record], download => {
      videoIsFullDownloading = false;
      const blob = new Blob(download.chunksReceived, { type: download.record.fileMimeType })
      videoRef.src = URL.createObjectURL(blob);
      videoJsInstance = startVideoJS()
     });
    });
   }
  }
 })

 onMount(() => {
  console.log('dasdas acc', acc);
  loadingData = true;
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

   fetchingPoster = true;
   getFileChunk({ offsetBytes: 0, chunkSize: 1024 * 512 }).then(firstChunk => {
    console.log('!!! firstChunk', firstChunk);
    MediaUtils.extractThumbnail(new Blob([firstChunk.chunk.data], { type: record.fileMimeType }))
     .then(thumbnailBlob => {
      console.log('!!! thumbnailBlob', thumbnailBlob);
      // set thumbnailBlob to img src
      thumbnailSrc = URL.createObjectURL(thumbnailBlob);
      // mediaHandler.player.poster(thumbnailSrc);
      // mediaHandler.player.width(140);
      // mediaHandler.player.height(280);
      console.log('settting!"!', thumbnailSrc);
     }).catch(err => {
      posterError = true;
     }).finally(() => {
      fetchingPoster = false;
     });
   })
  }).finally(() => {
   loadingData = false;
  });
 });
</script>

<VideoView
 upload={upload}
 download={download}
 thumbnailSrc={thumbnailSrc}
 bind:videoRef={videoRef}
 startVideo={startVideo}
 onDownload={onDownload}
 uploadId={uploadId}
 videoStarted={videoStarted}
 videoStarting={videoStarting}
 loadingData={loadingData}
 fetchingPoster={fetchingPoster}
 posterError={posterError}
 videoIsFullDownloading={videoIsFullDownloading}
/>
