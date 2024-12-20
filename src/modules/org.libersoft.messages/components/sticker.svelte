<script>
 import lottie from 'lottie-web';
 import pako from 'pako';
 import { getContext, onMount, onDestroy } from 'svelte';
 import { readable } from 'svelte/store';

 export let file = '';
 export let size = 200;
 export let play_on_start = true; //todo

 let component_container;
 let anim_container;
 let isLottie = false;
 let is_loading = false;
 let error;
 let observer;
 let playing = false;
 let ext;
 let anim;
 let is_in_viewport = false;
 let mouse_over = false;

 let ContextMenu = getContext('ContextMenu');
 let ContextMenuOpen = ContextMenu ? ContextMenu.isOpen : readable(undefined);

 onMount(async () => {
  //console.log(file);
  ext = file.split('.').pop().toLowerCase();
  if (ext === 'lottie' || ext === 'json' || ext === 'tgs') {
   isLottie = true;
  }
 });

 onDestroy(() => {
  if (anim) {
   anim.stop();
   anim.destroy();
  }
 });

 $: on_update_should_be_playing($ContextMenuOpen, is_in_viewport, mouse_over, anim_container, anim);

 async function on_update_should_be_playing(ContextMenuOpen, is_in_viewport, mouse_over, anim_container, anim) {
  console.log('on_update_should_be_playing ContextMenuOpen:', ContextMenuOpen, 'is_in_viewport:', is_in_viewport, 'mouse_over', mouse_over, 'anim_container:', anim_container, 'anim:', anim);

  if (!anim_container) return;

  let should_be_loaded = (ContextMenuOpen === undefined || ContextMenuOpen) && is_in_viewport;
  let should_be_playing = should_be_loaded && (ContextMenuOpen === undefined || (ContextMenuOpen && mouse_over));
  if (should_be_playing) should_be_loaded = true;

  console.log('should_be_loaded:', should_be_loaded, 'should_be_playing:', should_be_playing);

  if (should_be_playing) {
   if (anim) {
    playing = true;
   } else {
    load_lottie();
   }
  } else if (should_be_loaded) {
   if (anim) {
    playing = false;
   } else {
    load_lottie();
   }
  } else {
   playing = false;
  }
 }

 $: update_playing(playing);

 function update_playing(playing) {
  if (!anim) return;
  if (playing) {
   anim.play();
  } else {
   anim.pause();
  }
 }

 $: setup_observer(anim_container);

 function setup_observer(anim_container) {
  if (!anim_container) return;
  //console.log('create sticker observer');
  observer = new IntersectionObserver(
   entries => {
    is_in_viewport = entries[0].isIntersecting;
    //console.log(entries, 'is_in_viewport: ', is_in_viewport);
   },
   {
    threshold: 0.1,
    root: null,
   }
  );
  observer.observe(anim_container);
 }

 async function load_lottie() {
  if (is_loading) return;
  is_loading = true;

  let path;
  let animationData;

  if (ext === 'tgs') {
   animationData = await loadTgs(file);
  } else {
   //path = file;
   animationData = await loadJson(file);
  }

  if (error) {
   console.log('loading ', file, 'error', error);
   return;
  }

  /*
  console.log('STICKER file:', file);
  console.log('STICKER path:', path);
  console.log('STICKER animationData:', animationData);
*/

  /*
   lottie.setQuality() -- default 'high', set 'high','medium','low', or a number > 1 to improve player performance. In some animations as low as 2 won't show any difference.
    lottie.freeze() -- Freezes all playing animations or animations that will be loaded
   */

  let start = Date.now();

  anim = lottie.loadAnimation({
   container: anim_container,
   renderer: 'canvas',
   loop: true,
   autoplay: playing,
   path,
   animationData,
  });

  anim.onComplete = () => {
   console.log('lottie animation completed');
  };
  /*
  anim.onLoopComplete = () => {
   console.log('lottie animation loop completed');
  };
*/
  anim.addEventListener('config_ready', () => {
   console.log('lottie config ready after ' + (Date.now() - start) + 'ms');
  });

  anim.addEventListener('data_ready', () => {
   console.log('lottie data ready after ' + (Date.now() - start) + 'ms');
  });

  anim.addEventListener('loaded_images', () => {
   console.log('lottie loaded images after ' + (Date.now() - start) + 'ms');
  });

  anim.addEventListener('DOMLoaded', () => {
   console.log('lottie DOM loaded after ' + (Date.now() - start) + 'ms');
  });

  console.log('constructed lottie in ' + (Date.now() - start) + 'ms');
 }

 async function intersection(entries) {
  //console.log(entries);
  entries.sort((a, b) => a.time - b.time);
  for (let entry of entries) {
   is_in_viewport = entries[0].isIntersecting;
  }
 }

 async function loadTgs(file) {
  try {
   let start = Date.now();
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
    error = `Error loading ${file}, status: ${response.status}`;
    return;
   }
   const arrayBuffer = await response.arrayBuffer();
   const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
   console.log('fetched ' + file + ' in ' + (Date.now() - start) + 'ms');
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
   console.log('fetched ' + file + ' in ' + (Date.now() - start) + 'ms');
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

<div class="sticker" style="width: {size}px; height: {size}px;" bind:this={component_container} on:mouseover={() => (mouse_over = true)} on:mouseleave={() => (mouse_over = false)}>
 {#if error}
  <p>{error}</p>
 {:else if isLottie}
  <div class="lottie" bind:this={anim_container}></div>
 {:else}
  <img class="image" style="width: {size}px; height: {size}px;" src={file} alt="" />
 {/if}
</div>
