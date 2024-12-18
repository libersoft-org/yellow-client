<script>
 import lottie from 'lottie-web';
 import pako from 'pako';
 import { onMount, tick } from 'svelte';

 export let file = '';
 export let size = 200;
 export let autoplay = true;

 let container;
 let isLottie = false;
 let error;

 onMount(async () => {
  console.log(file);
  const ext = file.split('.').pop().toLowerCase();
  if (ext === 'lottie' || ext === 'json' || ext === 'tgs') {
   isLottie = true;
   await tick();

   let path;
   let animationData;

   if (ext === 'tgs') {
    animationData = await loadTgs(file);
   } else {
    //path = file;
    animationData = await loadJson(file);
   }

   console.log('STICKER file:', file);
   console.log('STICKER path:', path);
   console.log('STICKER animationData:', animationData);

   if (error) {
    console.error(error);
    return;
   }

   let start = Date.now();
   lottie.loadAnimation({
    container: container,
    renderer: 'canvas',
    loop: true,
    autoplay,
    path,
    animationData,
   });
   console.log('loaded lottie in ' + (Date.now() - start) + 'ms');
  }
 });

 async function loadTgs(file) {
  try {
   const response = await fetch(file);
   if (!response.ok) {
    error = `Error loading ${file}, status: ${response.status}`;
    return;
   }
   const arrayBuffer = await response.arrayBuffer();
   const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
   return JSON.parse(decompressed);
  } catch (e) {
   error = 'Error loading .tgs file: ' + e.message;
  }
 }

 async function loadJson(file) {
  try {
   let start = Date.now();
   const response = await fetch(file);
   if (!response.ok) {
    error = `Error loading ${file}, status: ${response.status}`;
    return;
   }
   let r = await response.json();
   console.log('loaded ' + file + ' in ' + (Date.now() - start) + 'ms');
   return r;
  } catch (e) {
   error = 'Error loading json file: ' + e.message;
  }
 }
</script>

<style>
 .sticker {
  max-width: 100%;
  max-height: 100%;
 }

 .lottie {
  width: 100%;
  height: 100%;
 }

 .image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
 }
</style>

<div class="sticker" style="width: {size}px; height: {size}px;">
 {#if error}
  <p>{error}</p>
 {:else if isLottie}
  <div class="lottie" bind:this={container}></div>
 {:else}
  <img class="image" style="width: {size}px; height: {size}px;" src={file} alt="" />
 {/if}
</div>
