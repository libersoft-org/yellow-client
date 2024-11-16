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


 /* todo: sometimes, intersection observer does not work properly. add timer? */
 function handleIntersect(entries) {
  let _loaderIsVisible = entries[0].isIntersecting;
  if (_loaderIsVisible && !loader.loading) loadMore();
 }

 function loadMore() {
  loader.loading = true;
  console.log('loadMore: loader:', loader);
  timer = setTimeout(() => {
   console.log('loadMore: loadMessages...');
   loadMessages(loader.conversation.acc, loader.conversation.address, loader.base, loader.prev, loader.next, (_res) => {
    console.log('loadMessages: _res:', _res);
    loader.loading = false
   });
  }, 500);
 }


</script>

 <div bind:this={loaderElement}>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  Load more messages...
 {JSON.stringify({ ...loader, conversation: undefined }, null, 2)}
<!-- {#if loader.loading}
  <Spinner />
 {/if}-->
 </div>
