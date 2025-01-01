<script>
 import { loadMessages, insertEvent, messagesArray } from '../messages.js';
 import { getContext, onDestroy, onMount } from 'svelte';
 import Spinner from '../../../core/components/spinner.svelte';
 export let loader;
 let loaderElement;
 let observer;
 let observing = false;
 const threshold = 0.6;
 let interval;
 let contentElement = getContext('contentElement');

 onMount(() => {
  //console.log('LOADER MOUNTED:', loader);
  observing = false;
 });

 $: setup(loaderElement, loader);
 //$: console.log('LOADER CHANGED:', loader);

 function setup(loaderElement, loader) {
  //console.log('setup: loaderElement:', loaderElement, 'loader:', loader, 'active:', loader.active);
  if (!loader.active) return;
  //console.log('OBSERVINGOBSERVINGOBSERVING:', observing);
  if (loaderElement && !observing) {
   observer = new IntersectionObserver(handleIntersect, { threshold, root: contentElement });
   observer.observe(loaderElement);
   //console.log('loader ', loader, ' is now observing.');
   observing = true;
   //console.log('setup: observer:', observer);
   setupInterval();
  }
 }

 function setupInterval() {
  interval = setInterval(() => {
   //console.log('check loaderElement:', loaderElement, loader.loading, loaderElement?.getBoundingClientRect(), window.innerHeight);
   if (loader.loading) clearInterval(interval);
   if (!loader.loading && loaderElement) {
    if (loaderElement.getBoundingClientRect().top < window.innerHeight && loaderElement.getBoundingClientRect().bottom > 0) {
     //console.log('loaderElement is visible, load triggered by loader.timer.');
     handleIntersect([{ isIntersecting: true }]);
    }
   }
  }, 1111);
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
  //console.log('LOADmORE: LOADER:', loader);
  loader.request = '???';
  loader.timer = setTimeout(() => {
   //console.log('LOADmORE: LOADmESSAGES...');
   loader.request = loadMessages(loader.conversation.acc, loader.conversation.address, loader.base, loader.prev, loader.next, loader.reason, _res => {
    //console.log('LOADmESSAGES: _RES:', _res);
    loader.loading = false;
    loader.delete_me = true;
   });
  }, 0);
 }
</script>

<style>
 .container {
  min-height: 40px;
 }
</style>

<div class="container">
 <div bind:this={loaderElement}>
  <!--
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  Loading more messages...
  <br/><pre>{JSON.stringify({ ...loader, conversation: undefined }, null, 2)}</pre>
  -->
  <!--  <Button text="Load more" onClick={loadMore} /> -->
  <Spinner show={loader.loading} />
 </div>
</div>
