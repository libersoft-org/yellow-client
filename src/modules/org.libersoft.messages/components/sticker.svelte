<script>
 import lottie from 'lottie-web';
 import { onMount, tick } from 'svelte';
 export let file = '';
 let container;
 let isLottie = false;

 async function load() {
  const ext = file.split('.').pop().toLowerCase();
  //console.log('ext:', ext);
  if (ext === 'lottie' || ext === 'json') {
   const animationData = await fetch('/modules/org.libersoft.messages/img/animated.json');
   const d = await animationData.json();
   //console.log('d:', d);
   isLottie = true;
   await tick();
   const animation = lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    //path: file,
    animationData: d,
   });

   console.log(ext + 'animation:');
   console.log(animation);

   if (!animation) {
    console.log('animation is null');
   }

   animation.addEventListener('complete', () => {
    console.log('animation complete');
   });

   animation.addEventListener('data_ready', () => {
    console.log('animation data_ready');
    animation.play();
   });

   animation.addEventListener('DOMLoaded', () => {
    console.log('animation DOMLoaded');
   });

   animation.addEventListener('enterFrame', () => {
    console.log('animation enterFrame');
   });

   animation.addEventListener('loopComplete', () => {
    console.log('animation loopComplete');
   });

   animation.addEventListener('data_failed', () => {
    console.log('animation data_failed');
   });

   animation.addEventListener('destroy', () => {
    console.log('animation destroy');
   });

   animation.addEventListener('loaded_images', () => {
    console.log('animation loaded_images');
   });
  }
 }

 onMount(load);
</script>

<style>
 .sticker {
  width: 200px;
  max-width: 100%;
  height: 200px;
  max-height: 100%;
 }

 .lottie {
  height: 10em;
 }
</style>

<!--<button on:click={load}>load</button>-->
<div class="sticker">
 {#if isLottie}
  <div class="lottie" bind:this={container}></div>
 {:else}
  <img src={file} alt="sticker" style="width: 100%; height: 100%; object-fit: contain;" />
 {/if}
</div>
