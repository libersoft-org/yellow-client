<script>
 import { loadMessages } from '../messages.js';
 import { onDestroy, onMount } from "svelte";

 export let loader;
 export let contentElement;

 let loaderElement;
 let observer;
 let timer;
 let observing = false;
 const threshold = 0.1;


 onMount(() => {
  //console.log('contentElement is ' + contentElement);
  //console.log('loaderElement is ' + loaderElement);
  observer = new IntersectionObserver(handleIntersect, { threshold, root: contentElement });
  if (loaderElement) {
   observer.observe(loaderElement);
   observing = true;
  }
 });


 onDestroy(() => {
  if (observer) observer.disconnect();
  if (timer) clearTimeout(timer);
 });


 $: if (observer && loaderElement) {
  if (!observing) {
   observer.observe(loaderElement);
  }
  handleIntersect([{ isIntersecting: true }]);
 }


 function handleIntersect(entries) {
  //console.log('handleIntersect:')
  //console.log(entries);
  let _loaderIsVisible = entries[0].isIntersecting;
  //if (_loaderIsVisible && !loader.loading) loadMore();
 }

 function mouseDown() {
  loadMore();
 }

 function loadMore() {
  loader.loading = true;
  loadMessages(loader.conversation.acc, loader.conversation.address, loader.base, loader.prev, loader.next, (_res) => {
   loader.loading = false
  });
 }


</script>

<style>

 .loader {

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

<div>
 v
 <hr>
 v
 <hr>
 v
 <hr>
 v
 <hr>
 v
 <hr>

 {#if loader.loading}
  <div class="loader"></div>
 {/if}

 <div bind:this={loaderElement}>
 {JSON.stringify({ ...loader, conversation: undefined }, null, 2)}
 </div>

 <button on:click={mouseDown}>Click me</button>

 <hr>
 ^
 <hr>
 ^
 <hr>
 ^
 <hr>
 ^
 <hr>
 ^
</div>
