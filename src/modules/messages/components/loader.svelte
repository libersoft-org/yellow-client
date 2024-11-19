<script>
 import { loadMessages, insertEvent, messagesArray } from '../messages.js';
 import { getContext, onDestroy, onMount } from "svelte";
 import Button from '../../../core/components/button.svelte';
 import Spinner from '../../../core/components/spinner.svelte';
 import { get } from "svelte/store";

 export let loader;
 export let active;

 let loaderElement;
 let observer;

 let observing = false;
 const threshold = 0.6;
 let interval;

 let contentElement = getContext('contentElement');

 $: setup(loaderElement, active);
 $: console.log('LOADER CHANGED:', loader);

 function setup(loaderElement) {
  console.log('setup: loaderElement:', loaderElement, 'loader:', loader, 'active:', active);
  if (!active) return;
  if (loaderElement && !observing) {
   observer = new IntersectionObserver(handleIntersect, { threshold, root: contentElement });
   observer.observe(loaderElement);
   observing = true;
   console.log('setup: observer:', observer);
   setupInterval();
  }
 }

 function setupInterval()
 {
   interval = setInterval(() => {
    //console.log('check loaderElement:', loaderElement, loader.loading, loaderElement?.getBoundingClientRect(), window.innerHeight);
    if (loader.loading) clearInterval(interval);
    if (!loader.loading && loaderElement) {
     if (loaderElement.getBoundingClientRect().top < window.innerHeight && loaderElement.getBoundingClientRect().bottom > 0) {
      //console.log('loaderElement is visible, load triggered by loader.timer.');
      handleIntersect([{ isIntersecting: true }]);
     }
    }
   }, 1000);
 }


 onDestroy(() => {
  if (observer) observer.disconnect();
  if (interval) clearInterval(interval);
 });


 /* todo: sometimes, intersection observer does not work properly. add timer? */
 function handleIntersect(entries) {
  let _loaderIsVisible = entries[0].isIntersecting;
  if (_loaderIsVisible && !loader.loading) loadMore();
 }


 function loadMore() {
  clearInterval(interval);
  loader.loading = true;
  console.log('LOADmORE: LOADER:', loader);
  loader.request = '???';
  loader.timer = setTimeout(() => {
   console.log('LOADmORE: LOADmESSAGES...');
   loader.request = loadMessages(loader.conversation.acc, loader.conversation.address, loader.base, loader.prev, loader.next, 'lazyload_prev', (_res) => {
    console.log('LOADmESSAGES: _RES:', _res);
    loader.loading = false;
    loader.delete_me = true;
   });
  }, 0);
 }


</script>

<style>

 .container {
  height: 340px;
 }

</style>


<div class="container">

 <div bind:this={loaderElement}>
<!--   <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  Loading more messages...

  <br/><pre>{JSON.stringify({ ...loader, conversation: undefined }, null, 2)}</pre>

  -->
<!--  <Button on:click={loadMore}>Load more</Button> -->
  <Spinner show={loader.loading} />
 </div>

</div>
