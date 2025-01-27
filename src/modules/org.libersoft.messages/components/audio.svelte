<script>
 import { identifier } from '../messages.js';
 import BaseButton from '../../../core/components/base-button.svelte';
 import WaveSurfer from 'wavesurfer.js';
 import { onMount } from 'svelte';
 export let file;
 let wavesurfer;
 let isPlaying = false;
 let waveRef;
 let duration = '';
 let time = '';

 onMount(async () => {
  try {
   wavesurfer = WaveSurfer.create({
    sampleRate: 48000,
    container: waveRef,
    waveColor: '#999',
    progressColor: '#ea0',
    barWidth: 3,
    responsive: true,
    height: 50,
    autoplay: false,
    url: file,
   });
   wavesurfer.on('decode', d => (duration = formatTime(d)));
   wavesurfer.on('timeupdate', t => (time = formatTime(t)));
   wavesurfer.on('interaction', () => wavesurfer.play());
   wavesurfer.on('play', () => (isPlaying = true));
   wavesurfer.on('pause', () => (isPlaying = false));
   wavesurfer.on('finish', () => (isPlaying = false));
  } catch (error) {
   console.error('Error initializing WaveSurfer:', error);
  }

  try {
   //await wavesurfer.load(file);
  } catch (error) {
   console.error('Error loading file:', error);
  }
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
</script>

<style>
 .voice-message {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 300px;
  max-width: 300px;
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
  width: 100%;
  height: 50px;
 }

 .time {
  display: flex;
  flex-direction: column;
  align-items: end;
 }
</style>

<div class="voice-message">
 <div class="player">
  <BaseButton onClick={clickPlay}>
   <div class="play">
    <img src="modules/{identifier}/img/{isPlaying ? 'pause' : 'play'}.svg" alt={isPlaying ? 'Pause' : 'Play'} />
   </div>
  </BaseButton>
  <div class="wave" bind:this={waveRef}></div>
 </div>
 <div class="time">{time ? time : '00:00'} / {duration}</div>
</div>
