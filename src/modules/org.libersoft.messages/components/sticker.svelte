<script>
 import lottie from 'lottie-web';
 import pako from 'pako';
 import { getContext, onMount, onDestroy } from 'svelte';
 import { readable } from 'svelte/store';
 import { identifier } from '../messages.js';
 import { render_stickers_as_raster, animate_all_stickers } from '../stickers.js';

 export let file = '';
 export let size = 200;

 let componentContainer;
 let animContainer;
 let isLottie = false;
 let isImage = false;
 let isLoading = false;
 let error;
 let observer;
 let playing = false;
 let ext;
 let anim;
 let isInViewport = false;
 let mouseOver = false;
 let elStaticImg;
 let ContextMenu = getContext('ContextMenu');
 let ContextMenuOpen = ContextMenu ? ContextMenu.isOpen : readable(undefined);
 let renderer = 'svg';
 let animationData;

 render_stickers_as_raster.subscribe(value => {
  if (value) renderer = 'canvas';
  else renderer = 'svg';
  if (animationData) {
   if (anim) anim.destroy();
   construct_lottie();
  }
 });

 $: update_playing(playing);

 ext = file.split('.').pop().toLowerCase();
 //  console.log('STICKER file:', file, 'ext:', ext);
 if (ext === 'lottie' || ext === 'json' || ext === 'tgs') isLottie = true;
 else isImage = true;

 onDestroy(() => {
  if (anim) {
   anim.stop();
   anim.destroy();
  }
 });

 $: on_update_should_be_playing($ContextMenuOpen, isInViewport, $animate_all_stickers, mouseOver, animContainer, anim);

 async function on_update_should_be_playing(ContextMenuOpen, isInViewport, animate_all_stickers, mouseOver, animContainer, anim) {
  if (!animContainer) return;
  let should_be_loaded = (ContextMenuOpen === undefined || ContextMenuOpen) && isInViewport;
  let should_be_playing = should_be_loaded && (animate_all_stickers || mouseOver);

  if (should_be_playing) {
   if (anim) playing = true;
   else load_lottie();
  } else if (should_be_loaded) {
   if (anim) playing = false;
   else load_lottie();
  } else playing = false;
 }

 function update_playing(playing) {
  if (!anim) return;
  if (playing) anim.play();
  else anim.pause();
 }

 $: setup_observer(animContainer);

 function setup_observer(animContainer) {
  if (!animContainer) return;
  //console.log('create sticker observer');
  observer = new IntersectionObserver(
   entries => {
    isInViewport = entries[0].isIntersecting;
    //console.log(entries, 'isInViewport: ', isInViewport);
   },
   {
    threshold: 0.1,
    root: null,
   }
  );
  observer.observe(animContainer);
 }

 async function load_lottie() {
  if (isLoading) return;
  isLoading = true;
  if (ext === 'tgs') animationData = await loadTgs(file);
  else animationData = await loadJson(file);
  if (error) {
   console.log('loading ', file, 'error', error);
   return;
  }
  /*
  console.log('STICKER file:', file);
  console.log('STICKER animationData:', animationData);
  */
  await construct_lottie();
 }

 async function construct_lottie() {
  let start = Date.now();

  anim = lottie.loadAnimation({
   container: animContainer,
   renderer,
   //renderer: 'canvas',
   loop: true,
   autoplay: playing,
   animationData,
  });

  /*
  anim.onComplete = () => {
   console.log('lottie animation completed');
  };
  anim.onLoopComplete = () => {
   console.log('lottie animation loop completed');
   // how to control the rendering fps of a lottie-web animation?
   //console.log(anim);
   //anim.frameModifier = 1/30;
   //anim.frameMult = 1;
   //anim.frameRate = 12;
   //anim.setSpeed(0.5)

   // ???
  lottie.setQuality() -- default 'high', set 'high','medium','low', or a number > 1 to improve player performance. In some animations as low as 2 won't show any difference.
  lottie.freeze() -- Freezes all playing animations or animations that will be loaded
   //anim.resize()

  };
  anim.addEventListener('config_ready', () => {
   console.log('lottie config ready after ' + (Date.now() - start) + 'ms');
  });

  anim.addEventListener('data_ready', () => {
   console.log('lottie data ready after ' + (Date.now() - start) + 'ms');
  });

 */
  /*
  anim.addEventListener('loaded_images', () => {
   console.log('lottie loaded images after ' + (Date.now() - start) + 'ms');
  });
  anim.addEventListener('DOMLoaded', () => {
   console.log('lottie DOM loaded after ' + (Date.now() - start) + 'ms');
  });
  */
  console.log('constructed lottie in ' + (Date.now() - start) + 'ms');
 }

 async function intersection(entries) {
  //console.log(entries);
  entries.sort((a, b) => a.time - b.time);
  for (let entry of entries) {
   isInViewport = entries[0].isIntersecting;
  }
 }

 async function loadTgs(file) {
  try {
   //let start = Date.now();
   /*
    https://www.digitalocean.com/community/tutorials/how-to-implement-browser-caching-with-nginx-s-header-module-on-centos-8
    https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#fresh_and_stale_based_on_age
    https://redbot.org/?uri=https://stickers.libersoft.org/download/1/1f308.tgs
    https://developers.cloudflare.com/cache/concepts/cache-responses/
   */
   const response = await fetch(file, {
    /*force-cache — The browser looks for a matching request in its HTTP cache.
    If there is a match, fresh or stale, it will be returned from the cache. */
    cache: 'force-cache',
    /*Request.integrity Read only
    Contains the subresource integrity value of the request (e.g., sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=).
    cat FILENAME.js | openssl dgst -sha384 -binary | openssl base64 -A
    */
   });
   if (!response.ok) {
    error = `Error loading TGS ${file}, status: ${response.status}`;
    return;
   }
   const arrayBuffer = await response.arrayBuffer();
   const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
   //console.log('fetched ' + file + ' in ' + (Date.now() - start) + 'ms');
   return JSON.parse(decompressed);
  } catch (e) {
   error = 'Error loading TGS file: ' + e;
  }
 }

 async function loadJson(file) {
  try {
   //let start = Date.now();
   const response = await fetch(file);
   if (!response.ok) {
    error = `Error loading JSON ${file}, status: ${response.status}`;
    return;
   }
   let r = await response.json();
   //console.log('fetched ' + file + ' in ' + (Date.now() - start) + 'ms');
   return r;
  } catch (e) {
   error = 'Error loading JSON file: ' + e;
  }
 }

 function static_img_load_error(event) {
  error = 'Error loading IMG: ' + event.detail;
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

 .error {
  font-size: 10px;
 }
</style>

<div class="sticker" role="button" tabindex="0" bind:this={componentContainer} on:mouseover={() => (mouseOver = true)} on:mouseleave={() => (mouseOver = false)} on:focus={() => (mouseOver = true)} on:blur={() => (mouseOver = false)}>
 {#if error}
  <img class="image" style="width: {size}px; height: {size}px;" src="modules/{identifier}/img/question.svg" alt="" />
  <div class="error">{error}</div>
 {:else if isLottie}
  <div class="lottie" style="width: {size}px; height: {size}px;" bind:this={animContainer}></div>
 {:else if isImage}
  <img
   class="image"
   style="width: {size}px; height: {size}px;"
   src={file}
   alt=""
   bind:this={elStaticImg}
   on:error={e => {
    static_img_load_error(e);
   }}
  />
 {/if}
</div>
