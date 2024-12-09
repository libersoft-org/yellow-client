<script>
 import lottie from 'lottie-web';
 import { onMount } from 'svelte';
 export let file = '';
 let container;
 let isLottie = false;

 onMount(() => {
  const ext = file.split('.').pop().toLowerCase();
  if (ext === 'lottie' || ext === 'json') {
   isLottie = true;
   const animation = lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: file,
   });
   return () => animation.destroy();
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
</style>

<div class="sticker">
 {#if isLottie}
  <div bind:this={container} style="width: 100%; height: 100%;"></div>
 {:else}
  <img src={file} alt="sticker" style="width: 100%; height: 100%; object-fit: contain;" />
 {/if}
</div>
