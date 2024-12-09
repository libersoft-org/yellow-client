<script>
 import lottie from 'lottie-web';
 import { onMount, tick } from 'svelte';
 export let file = '';
 let container;
 let isLottie = false;

 onMount(async () => {
  const ext = file.split('.').pop().toLowerCase();
  if (ext === 'lottie' || ext === 'json') {
   isLottie = true;
   await tick();
   lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: file,
   });
  }
 });
</script>

<style>
 .sticker {
  width: 200px;
  max-width: 100%;
  height: 200px;
  max-height: 100%;
 }

 .lottie {
  width: 100%;
  height: 100%;
 }

 .image {
  width: 100%;
  height: 100%;
  object-fit: contain;
 }
</style>

<div class="sticker">
 {#if isLottie}
  <div class="lottie" bind:this={container}></div>
 {:else}
  <img class="image" src={file} alt="" />
 {/if}
</div>
