<script lang="ts">
 import 'videojs-record/dist/css/videojs.record.css';
 import videoJS from 'video.js';
 import 'videojs-record/dist/videojs.record.js';
 import 'recordrtc';
 import { onDestroy, onMount } from 'svelte';
 import VideoRecorderView from '@/org.libersoft.messages/components/VideoRecorder/VideoRecorderView.svelte';
 import useVideoRecorder from '@/org.libersoft.messages/components/VideoRecorder/useVideoRecorder.svelte.ts';
 import { setupMicPulseIndicator } from '@/org.libersoft.messages/components/VideoRecorder/videoRecorderUtils.ts';
 import { get } from 'svelte/store';
 import { initUpload, selectedConversation } from '@/org.libersoft.messages/messages';
 import { FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.ts';
 import { assembleFile } from '@/org.libersoft.messages/services/Files/utils.ts';

 let videoRef = $state<HTMLVideoElement | null>(null);
 let micIndicatorRef = $state<HTMLElement | null>(null);
 let sending = $state(false);
 let playerInstance: ReturnType<typeof videoJS> | null = null;

 const { setup, loading, error, errorMessages, videoDevices, audioDevices, selectedVideoDeviceId, selectedAudioDeviceId, changeVideoInput, changeAudioInput, player, recordedBlob, toggleMute, isMuted, facingMode, toggleFacingMode, userDeviceId, environmentDeviceId } = useVideoRecorder(() => videoRef, {
  controls: false,
  bigPlayButton: false,
  fill: true,
  plugins: {
   record: {
    audio: true,
    video: true,
    maxLength: Infinity,
    debug: true,
   },
  },
 });

 const enableToggleFacingMode = $derived(Boolean($userDeviceId && $environmentDeviceId && $userDeviceId !== $environmentDeviceId));
 let isRecording = $state(false);

 const start = () => {
  if (playerInstance) {
   playerInstance.dispose();
   $player.show();
  }

  const record = $player.record();
  console.log('rec: start', record.isRecording());

  record.start();
  isRecording = true;
 };

 let manuallyStop = false;
 const stop = () => {
  console.log('rec: stop');

  const record = $player.record();
  record.stop();
  //record.stopDevice(); todo: stop stream and then restart if needed by start method
  //record.reset();
  isRecording = false;
  manuallyStop = true;
 };

 let sendingRequested = false;
 const send = () => {
  sending = true;
  const record = $player.record();
  console.log('record.isRecording()', record.isRecording());
  if (record.isRecording()) {
   sendingRequested = true;
   record.stop();
  } else {
   console.log('sending', $recordedBlob);
   sendMessage($recordedBlob);
  }
 };

 const sendMessage = async (blob: Blob) => {
  sending = true;
  const recipientEmail = get(selectedConversation).address;
  //blob.name = 'Video record.webm';
  initUpload([blob], FileUploadRecordType.SERVER, [recipientEmail]).finally(() => {
   sending = false;
   recordedBlob.set(null);
  });
 };

 const download = () => {
  console.log('$recordedBlob', $recordedBlob);
  assembleFile($recordedBlob);
 };

 const showPreview = () => {
  $player.hide();

  console.log('$recordedBlob', $recordedBlob);
  const videoEl = document.createElement('video');
  videoEl.src = URL.createObjectURL($recordedBlob);
  videoEl.className = 'video-js vjs-default-skin';
  videoEl.setAttribute('controls', 'true');
  videoEl.setAttribute('playsinline', 'true');
  videoEl.setAttribute('webkit-playsinline', 'true');

  videoRef.appendChild(videoEl);

  playerInstance = videoJS(videoEl, {
   controls: true,
   autoplay: false,
   muted: false,
   preload: 'auto',
   seekable: true,
   fill: true,
  });

  playerInstance.on('error', function () {
   const error = playerInstance.error();
   // this is hack for bug in safari where it fires MEDIA_ERR_NETWORK but video is playable
   if (error && error.code === 2) {
    console.log('Ignoring MEDIA_ERR_NETWORK during blob playback.');
    playerInstance.error(null);
   }
  });
 };

 const startRecorder = () => {
  if (playerInstance) {
   playerInstance.dispose();
   playerInstance = null;
  }

  setup().then(_player => {
   _player.on('deviceReady', () => {
    const stream = _player.record().stream;
    setupMicPulseIndicator(stream, micIndicatorRef);
   });

   _player.on('startRecord', () => {
    isRecording = true;
   });

   _player.on('stopRecord', () => {
    isRecording = false;
   });

   _player.on('finishRecord', function () {
    try {
     if (sendingRequested) {
      sendMessage($recordedBlob);
     }
     if (manuallyStop) {
      showPreview();
     }
    } catch (err) {
     console.error('Error while finishing record:', err);
    } finally {
     manuallyStop = false;
     sendingRequested = false;
    }
   });
  });
 };

 onMount(() => {
  startRecorder();
 });

 onDestroy(() => {
  if (playerInstance) {
   playerInstance.dispose();
   playerInstance = null;
  }
  $player.dispose();
  console.log('onDestroy !!!!!!!!!!!!!!!!!!!!!!!!!!');
 });
</script>

<!--
<Dialog data={{title: 'das'}} bind:this={test}>
 test
</Dialog>
<button onclick={onTest}>test</button>
-->
<VideoRecorderView bind:videoRef bind:micIndicatorRef {sending} error={$error} errorMessages={$errorMessages} loading={$loading} videoDevices={$videoDevices} audioDevices={$audioDevices} selectedAudioDeviceId={$selectedAudioDeviceId} selectedVideoDeviceId={$selectedVideoDeviceId} {changeVideoInput} {changeAudioInput} {isRecording} recordStart={start} recordStop={stop} {send} {download} isMuted={$isMuted} {toggleMute} hasData={Boolean($recordedBlob)} facingMode={$facingMode} {toggleFacingMode} {enableToggleFacingMode} />
