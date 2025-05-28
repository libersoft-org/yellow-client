<script lang="ts">
 import { accounts_config } from '../core.js';
 import Button from '../components/Button/Button.svelte';
 import { onMount, onDestroy } from 'svelte';
 import jsQR from 'jsqr';

 type Props = {
  close: () => void;
 };

 let { close }: Props = $props();

 let videoElement: HTMLVideoElement | null = $state(null);
 let canvasElement: HTMLCanvasElement | null = $state(null);
 let stream: MediaStream | null = $state(null);
 let scanning = $state(false);
 let error = $state('');

 onMount(async () => {
  try {
   // Request camera access
   stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }, // Prefer back camera
   });

   if (videoElement) {
    videoElement.srcObject = stream;
    startScanning();
   }
  } catch (err) {
   error = 'Camera access denied or not available';
   console.error('Camera error:', err);
  }
 });

 onDestroy(() => {
  stopScanning();
  if (stream) {
   stream.getTracks().forEach(track => track.stop());
  }
 });

 function startScanning() {
  if (!videoElement || !canvasElement) return;

  scanning = true;
  requestAnimationFrame(scanFrame);
 }

 function stopScanning() {
  scanning = false;
 }

 function scanFrame() {
  if (!scanning || !videoElement || !canvasElement) return;

  const canvas = canvasElement;
  const video = videoElement;
  const ctx = canvas.getContext('2d');

  if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
   canvas.width = video.videoWidth;
   canvas.height = video.videoHeight;
   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

   try {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
     processQRCode(code.data);
     return;
    }
   } catch (err) {
    console.error('QR scanning error:', err);
   }
  }

  if (scanning) {
   requestAnimationFrame(scanFrame);
  }
 }

 function processQRCode(data: string) {
  try {
   const parsed = JSON.parse(data);
   accounts_config.set(parsed);
   close();
  } catch (err) {
   error = 'Invalid QR code - not valid JSON';
   console.error('QR code parsing error:', err);
  }
 }
</script>

<style>
 .qr-scanner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
 }

 .video-container {
  position: relative;
  max-width: 100%;
  max-height: 400px;
 }

 video {
  width: 100%;
  height: auto;
  border-radius: 10px;
 }

 canvas {
  display: none;
 }

 .error {
  color: #f00;
  text-align: center;
 }

 .instructions {
  text-align: center;
  color: #666;
 }
</style>

<div class="qr-scanner">
 {#if error}
  <div class="error">{error}</div>
 {:else}
  <div class="instructions">Point your camera at a QR code containing account configuration</div>

  <div class="video-container">
   <video bind:this={videoElement} autoplay playsinline></video>
   <canvas bind:this={canvasElement}></canvas>
  </div>
 {/if}

 <Button text="Cancel" onClick={close} />
</div>
