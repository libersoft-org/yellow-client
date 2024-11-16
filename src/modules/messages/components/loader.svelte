<script>
 import { loadMessages } from '../messages.js';
 import { getContext, onDestroy, onMount } from "svelte";

 export let loader;

 let loaderElement;
 let observer;
 let timer;
 let observing = false;
 const threshold = 0.6;

 let contentElement = getContext('contentElement');

 $: setup(loaderElement);


 function setup(loaderElement) {
  if (loaderElement && !observing) {
   observer = new IntersectionObserver(handleIntersect, { threshold, root: contentElement });
   observer.observe(loaderElement);
   observing = true;
  }
 }


 onDestroy(() => {
  if (observer) observer.disconnect();
  if (timer) clearTimeout(timer);
 });


 function handleIntersect(entries) {
  let _loaderIsVisible = entries[0].isIntersecting;
  if (_loaderIsVisible && !loader.loading) loadMore();
 }

 function loadMore() {
  loader.loading = true;
  timer = setTimeout(() => {
   loadMessages(loader.conversation.acc, loader.conversation.address, loader.base, loader.prev, loader.next, (_res) => {
    loader.loading = false
   });
  }, 500);
 }


</script>

<style>

 .loader {

  padding: 10px;
  margin: 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(farthest-side, var(--loader-color) 94%, transparent) top/8px 8px no-repeat,
  conic-gradient(transparent 30%, var(--loader-color));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 8px), var(--loader-color) 0);
  animation: loader 1s infinite linear;
 }

 @keyframes loader {
  100% {
   transform: rotate(1turn);
  }
 }

</style>


 <div bind:this={loaderElement}>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  Load more messages...
 {JSON.stringify({ ...loader, conversation: undefined }, null, 2)}
<!-- {#if loader.loading}
  <div class="loader"></div>
 {/if}-->
 </div>
