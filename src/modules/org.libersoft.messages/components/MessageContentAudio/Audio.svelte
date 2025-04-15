<script lang="ts">
 import { downloadAttachmentsSerial, identifier, loadUploadData, makeDownloadChunkAsyncFn } from '../../messages.js';
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 //import WaveSurfer from 'wavesurfer.js';
 import { onMount } from 'svelte';
 import MediaService from '@/org.libersoft.messages/services/Media/MediaService.ts';
 import MediaUtils from '@/org.libersoft.messages/services/Media/MediaUtils.ts';
 import { get, writable } from 'svelte/store';
 import { active_account } from '@/core/core.js';
 import { humanSize } from '@/core/utils/fileUtils.js';
 import MessageContentAttachment from '../MessageContentFile/MessageContentAttachment.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import fileDownloadStore from '@/org.libersoft.messages/stores/FileDownloadStore.ts';
 import { assembleFile } from '@/org.libersoft.messages/services/Files/utils.ts';
 import WaveSurfer from "wavesurfer.js";

 const { uploadId } = $props();

 let wavesurfer: WaveSurfer;
 let isPlaying = $state(false);
 let waveRef;
 let duration = $state('');
 let time = $state('');

 let mediaHandler = $state(null);
 let upload = $state(null);

 let download = writable(null);
 let isFullDownloading = $state(false);
 fileDownloadStore.store.subscribe(() => download.set(fileDownloadStore.get(uploadId) || null));

 function getFileChunkFactory(uploadId) {
  const fn = makeDownloadChunkAsyncFn(get(active_account));
  return params => fn({ uploadId, ...params });
 }

 const fullDownloadAudio = () => {
  isFullDownloading = true;
  downloadAttachmentsSerial([upload.record], download => {
   isFullDownloading = false;
   const blob = new Blob(download.chunksReceived, { type: download.record.fileMimeType })
   const url = URL.createObjectURL(blob)
   wavesurfer.load(url, [upload.record.metadata?.peaks], upload.record.metadata?.duration);
   wavesurfer.on('ready', () => {
    wavesurfer.play();
   });
  });
 }

 const setupWavesurfer = async (url: string) => {
  const { record } = upload;
  try {
   wavesurfer = WaveSurfer.create({
    sampleRate: 48000,
    container: waveRef,
    waveColor: '#999',
    progressColor: '#ea0',
    barWidth: 3,
    //responsive: true,
    height: 50,
    autoplay: false,
    //url,
    duration: record.metadata?.duration,
    peaks: [record.metadata?.peaks],
    backend: 'MediaElement',
   });
   wavesurfer.on('decode', d => (duration = formatTime(d)));
   wavesurfer.on('timeupdate', t => (time = formatTime(t)));
   wavesurfer.on('interaction', () => wavesurfer.play());
   wavesurfer.on('play', () => (isPlaying = true));
   wavesurfer.on('pause', () => (isPlaying = false));
   wavesurfer.on('finish', () => {
    isPlaying = false;
   });
   wavesurfer.on('ready', () => {
    //wavesurfer.play();
   });
   wavesurfer.on('error', err => {
    // console.error('WaveSurfer error:', err);
    if (err instanceof MediaError && (err.code === MediaError.MEDIA_ERR_NETWORK || err.code === MediaError.MEDIA_ERR_DECODE)) {
     fullDownloadAudio()
    }
   });
   init()
  } catch (error) {
   console.error('Error initializing WaveSurfer:', error);
  }
 }

 const init = async () => {
  const acc = get(active_account);
  const progressiveUrl = MediaUtils.makeProgressiveDownloadUrl(acc.id, upload.record.id);
  const progressiveDownloadAvailable = await MediaUtils.checkProgressiveDownloadAvailability(progressiveUrl)

  if (progressiveDownloadAvailable) {
   wavesurfer.load(progressiveUrl, [upload.record.metadata?.peaks], upload.record.metadata?.duration);
  }
 }

 onMount(() => {
  loadUploadData(uploadId).then(uploadData => {
   upload = uploadData;
   setupWavesurfer('')
  });
 });

 async function clickPlay() {
  if (wavesurfer) {
   try {
    await wavesurfer.playPause();
   } catch (err) {
    console.error('Error playing audio:', err);
    fullDownloadAudio()
   }
  }
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
  --wave-size: calc(60 * var(--messages-list-width) / 100);
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  max-width: 300px;
  margin-bottom: 8px;
 }

 .player {
  display: flex;
  align-items: center;
  gap: 10px;
 }

 .player .play {
  display: flex;
  padding: 10px;
  border: 1px solid #ba0;
  border-radius: 15px;
  background-color: #ec0;
 }

 .player .play img {
  width: 24px;
  height: 24px;
 }

 .player .wave {
  width: var(--wave-size);
  height: 50px;
  flex: 1 1 auto;
 }

 .player .actions {
  flex: 1 0 auto;
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
   <div class="actions">
    <BaseButton onClick={clickPlay}>
     <div class="play">
      <img src="modules/{identifier}/img/{isPlaying ? 'pause' : 'play'}.svg" alt={isPlaying ? 'Pause' : 'Play'} />
     </div>
    </BaseButton>
   </div>
   <div class="wave" bind:this={waveRef}></div>
  </div>
  <div class="time">{time ? time : '00:00'} / {duration}</div>
 </div>

 {#if !$download}
  <div class="">
   <Button img="modules/{identifier}/img/download.svg" onClick={onDownload} width="30px">Download</Button>
  </div>
 {:else}
  <MessageContentAttachment node={{ attributes: { id: { value: uploadId } } }} />
 {/if}
</div>
