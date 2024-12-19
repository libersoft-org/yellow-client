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
 let observer;
 let is_visible = false;
 let anim;

 $: update(is_visible);

 function update(is_visible) {
  if (!anim) return;
  if (is_visible) {
   anim.play();
  } else {
   anim.pause();
  }
 }

 onMount(async () => {
  if (!container) throw new Error('container not found');

  console.log('create sticker observer');
  observer = new IntersectionObserver(
   entries => {
    console.log(entries);
    is_visible = entries[0].isIntersecting;
   },
   {
    threshold: 0.1,
    root: null,
   }
  );
  observer.observe(intersection_observer_element);

  //console.log(file);
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

   if (error) {
    console.error('loading ', file, 'error', error);
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
    container: container,
    renderer: 'canvas',
    loop: true,
    autoplay: is_visible,
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
 });

 async function intersection(entries) {
  //console.log(entries);
  entries.sort((a, b) => a.time - b.time);
  for (let entry of entries) {
   is_visible = entries[0].isIntersecting;
  }
 }

 async function loadTgs(file) {
  try {
   /*
    https://stackoverflow.com/questions/28154796/xmlhttprequest-how-to-force-caching
    https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#caching_static_assets
   //request.headers.set('Accept-Encoding', 'gzip');?
   */

   /*
   https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#fresh_and_stale_based_on_age
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

<div class="sticker" style="width: {size}px; height: {size}px;">
 {#if error}
  <p>{error}</p>
 {:else if isLottie}
  <div class="lottie" bind:this={container}></div>
 {:else}
  <img class="image" style="width: {size}px; height: {size}px;" src={file} alt="" />
 {/if}
</div>
