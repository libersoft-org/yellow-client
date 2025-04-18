<script>
 import { downloadAttachmentsSerial, identifier, loadUploadData, makeDownloadChunkAsyncFn } from '../../messages.js';
 //import WaveSurfer from 'wavesurfer.js';
 import { onMount } from 'svelte';
 import MediaService from '../../services/media/MediaService.ts';
 //import MediaUtils from '../../services/media/Media.utils.ts';
 import { get, writable } from 'svelte/store';
 import { active_account } from '@/core/core.js';
 import { humanSize } from '@/core/utils/fileUtils.js';
 import MessageContentAttachment from '../MessageContentFile/MessageContentAttachment.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import fileDownloadStore from '../../stores/FileDownloadStore.ts';
 import { assembleFile } from '../../services/fileUpload/utils.ts';

 const { uploadId } = $props();

 let wavesurfer;
 let isPlaying = $state(false);
 let waveRef;
 let duration = $state('');
 let time = $state('');

 let mediaHandler = $state(null);
 let upload = $state(null);

 let download = writable(null);
 fileDownloadStore.store.subscribe(() => download.set(fileDownloadStore.get(uploadId) || null));

 function getFileChunkFactory(uploadId) {
  const fn = makeDownloadChunkAsyncFn(get(active_account));
  return params => fn({ uploadId, ...params });
 }

 onMount(async () => {
  loadUploadData(uploadId).then(uploadData => {
   upload = uploadData;
   const { record } = uploadData;

   const getFileChunk = getFileChunkFactory(uploadId);
   mediaHandler = new MediaService(null, getFileChunk, {
    id: record.id,
    totalSize: record.fileSize,
    fileMime: record.fileMimeType,
    chunkSize: 1024 * 1024 * 1,
   });

   try {
    wavesurfer = mediaHandler.setupWavesurfer(waveRef, {
     duration: record.metadata?.duration,
     peaks: [record.metadata?.peaks],
    });
    wavesurfer.on('decode', d => (duration = formatTime(d)));
    wavesurfer.on('timeupdate', t => (time = formatTime(t)));
    wavesurfer.on('interaction', () => wavesurfer.play());
    wavesurfer.on('play', () => (isPlaying = true));
    wavesurfer.on('pause', () => (isPlaying = false));
    wavesurfer.on('finish', () => {
     isPlaying = false;
    });
   } catch (error) {
    console.error('Error initializing WaveSurfer:', error);
   }
  });
 });

 function clickPlay() {
  if (wavesurfer) wavesurfer.playPause();
 }

 function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
   .toString()
   .padStart(2, '0');
  seconds = Math.floor(seconds % 60)
   .toString()
   .padStart(2, '0');
  return minutes + ':' + seconds;
 }

 function onDownload() {
  downloadAttachmentsSerial([upload.record], download => {
   assembleFile(new Blob(download.chunksReceived, { type: download.record.fileMimeType }), download.record.fileOriginalName);
  });
 }
</script>

<style>
 .voice-message {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 300px;
  max-width: 300px;
  margin-bottom: 8px;
 }

 .player {
  display: flex;
  align-items: center;
  gap: 10px;
 }

 .player .wave {
  width: 100%;
  height: 50px;
 }

 .time {
  display: flex;
  flex-direction: column;
  align-items: end;
 }
</style>

<div>
 <div class="voice-message">
  {#if upload}
   <div>
    <strong>{upload.record.fileOriginalName}</strong> ({humanSize(upload.record.fileSize)})
   </div>
  {:else}
   Loading...
  {/if}
  <div class="player">
   <Button img="modules/{identifier}/img/{isPlaying ? 'pause' : 'play'}.svg" alt={isPlaying ? 'Pause' : 'Play'} onClick={clickPlay} />
   <div class="wave" bind:this={waveRef}></div>
  </div>
  <div class="time">{time ? time : '00:00'} / {duration}</div>
 </div>
 {#if !$download}
  <div class="">
   <Button img="modules/{identifier}/img/download.svg" onClick={onDownload}>Download</Button>
  </div>
 {:else}
  <MessageContentAttachment node={{ attributes: { id: { value: uploadId } } }} />
 {/if}
</div>
