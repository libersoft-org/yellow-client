<script>
 import { identifier, initUpload, selectedConversation } from '../../messages.js';
 import Icon from '../../../../core/components/Icon/Icon.svelte';
 import audioRecorderStore from '@/org.libersoft.messages/stores/AudioRecorderStore.ts';
 import MediaRecorderService from '@/org.libersoft.messages/services/media/MediaRecorderService.ts';
 import { onMount } from 'svelte';
 import RecordPlugin from 'wavesurfer.js/plugins/record';
 import resize from '../../../../core/actions/resizeObserver.ts';
 import { get } from 'svelte/store';
 import { FileUploadRecordType } from '@/org.libersoft.messages/services/fileUpload/types.ts';
 import MediaUtils from '@/org.libersoft.messages/services/media/Media.utils.ts';

 let wavesurferRef = null;
 let isOpen = audioRecorderStore.isOpen();
 let recorderHandler = $state(new MediaRecorderService());
 let record = null;
 let isPaused = $state(false);
 let wavesurferWidth = $state(undefined);
 let sending = $state(false);

 const onResize = entry => {
  // We must explicitly set WaveSurfer's parent width; otherwise it causes flickering
  // (wavesurfer bug https://github.com/katspaugh/wavesurfer.js/issues/4055)
  wavesurferWidth = entry.contentRect.width;
 };

 $effect(() => {
  if ($isOpen) {
   startRecording();
  }
 });

 const sendMessage = async blob => {
  const recipientEmail = get(selectedConversation).address;
  const arrBuffer = await blob.arrayBuffer();
  const audioMetaData = await MediaUtils.getAudioDataFromArrayBuffer(arrBuffer);
  blob.name = 'Audio record.webm';
  blob.metadata = audioMetaData;
  initUpload([blob], FileUploadRecordType.SERVER, [recipientEmail]);
  audioRecorderStore.setOpen(false);
 };

 const startRecording = () => {
  isPaused = false;

  RecordPlugin.getAvailableAudioDevices().then(devices => {
   record.startRecording({ deviceId: 'default' }).then(() => {
    //console.log('startRecording');
   });
  });
 };

 const onPlay = () => {
  isPaused = false;
  record.resumeRecording();
 };

 const onPause = () => {
  isPaused = true;
  record.pauseRecording();
 };

 const onDelete = () => {
  audioRecorderStore.setOpen(false);
  record.destroy();
 };

 const onSend = () => {
  record.stopRecording();
  sending = true;
 };

 onMount(() => {
  record = recorderHandler.create(wavesurferRef);

  record.on('record-end', blob => {
   if (sending) {
    sendMessage(blob);
   }
  });
 });
</script>

<style>
 .message-bar-recorder {
  --border-radius: 8px;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #222;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
 }

 .wavesurfer-wrap {
  flex: 1 1 100%;
  background: #404040;
  border-radius: var(--border-radius);
  padding: 0 10px;
  position: relative;
 }

 .wavesurfer {
  width: 100%;
 }

 .is-paused .wavesurfer {
  opacity: 0.3;
 }

 .button-wrapper :global(.base-button) {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #404040;
  border-radius: var(--border-radius);
  width: 32px;
  height: 32px;
  flex: 1 0 auto;
 }
</style>

<div class="message-bar-recorder" class:is-paused={isPaused} style:display={$isOpen ? 'flex' : 'none'}>
 <div class="button-wrapper">
  <Icon img="modules/{identifier}/img/delete-red.svg" alt="Record voice message" size="14" padding="0" onClick={onDelete} />
 </div>
 <div class="button-wrapper">
  {#if isPaused}
   <Icon img="modules/{identifier}/img/play-yellow.svg" alt="Record voice message" size="14" padding="0" onClick={onPlay} />
  {:else}
   <Icon img="modules/{identifier}/img/pause-yellow.svg" alt="Record voice message" size="14" padding="0" onClick={onPause} />
  {/if}
 </div>
 <div class="wavesurfer-wrap">
  <div bind:this={wavesurferRef} class="wavesurfer" use:resize={onResize} style:width={wavesurferWidth ? wavesurferWidth + 'px' : '100%'}></div>
 </div>
 <div style:poiner-events={sending ? 'none' : 'auto'} style:cursor={sending ? 'not-allowed' : 'pointer'}>
  <Icon img="modules/{identifier}/img/send.svg" alt="Record voice message" size="32" padding="0" onClick={onSend} />
 </div>
</div>
