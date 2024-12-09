<script>
 import WaveSurfer from 'wavesurfer.js';
 import { onMount } from 'svelte';
 export let file;
 let wavesurfer;
 let isPlaying = false;
 let waveRef;
 let duration = '';
 let time = '';

 onMount(() => {
  wavesurfer = WaveSurfer.create({
   container: waveRef,
   waveColor: '#999',
   progressColor: '#555',
   barWidth: 2,
   responsive: true,
   height: 80,
   autoplay: false,
  });
  wavesurfer.load(file);
  wavesurfer.on('decode', d => (duration = formatTime(d)));
  wavesurfer.on('timeupdate', t => (time = formatTime(t)));
  wavesurfer.on('interaction', () => wavesurfer.play());
 });

 function clickPlay() {
  if (wavesurfer) {
   wavesurfer.playPause();
   isPlaying = !isPlaying;
  }
 }

 function keyPlay(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickPlay();
  }
 }

 function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return minutes + ':' + seconds;
 }
</script>

<style>
 .voice-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #000;
  border-radius: 10px;
  background-color: #bfb;
 }

 .player {
  display: flex;
  gap: 10px;
  border: 1px solid #888;
 }

 .player .play {
  padding: 10px;
  border: 1px solid #080;
  border-radius: 10px;
  background-color: #0b0;
 }

 .player .play img {
  width: 24px;
  height: 24px;
 }
</style>

<div class="voice-message">
 <div class="player">
  <div class="play" role="button" tabindex="0" on:click={clickPlay} on:keydown={keyPlay}>
   <img src="modules/org.libersoft.messages/img/{isPlaying ? 'play' : 'pause'}.svg" alt={isPlaying ? 'Pause' : 'Play'} />
  </div>
  <div bind:this={waveRef}></div>
 </div>
 <div class="duration">Duration: {duration}</div>
 <div class="time">Time: {time}</div>
</div>
