<script>
 import { loadMessages, events } from '../messages.js';
 import { getContext, onDestroy, onMount } from "svelte";
 import Button from '../../../core/components/button.svelte';
 import Spinner from '../../../core/components/spinner.svelte';

 export let loader;

 let loaderElement;
 let observer;
 let timer;
 let observing = false;
 const threshold = 0.6;
 let interval;

 let contentElement = getContext('contentElement');

 $: setup(loaderElement);
 $: console.log('LOADER CHANGED:', loader);

 function setup(loaderElement) {
  console.log('setup: loaderElement:', loaderElement);
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
      //console.log('loaderElement is visible, load triggered by timer.');
      handleIntersect([{ isIntersecting: true }]);
     }
    }
   }, 1000);
 }


 onDestroy(() => {
  if (observer) observer.disconnect();
  if (timer) clearTimeout(timer);
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
  timer = setTimeout(() => {
   console.log('loadMore: loadMessages...');
   loadMessages(loader.conversation.acc, loader.conversation.address, loader.base, loader.prev, loader.next, (_res) => {
    console.log('loadMessages: _res:', _res);
    loader.loading = false;
    events.update(x => x.concat('lazyload_prev'));
   });
  }, 2500);
 }


</script>

 <div bind:this={loaderElement}>
<!--   <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  <hr><hr><hr><hr><hr>
  Loading more messages...
  -->
  <br/><pre>{JSON.stringify({ ...loader, conversation: undefined }, null, 2)}</pre>
<!--  <Button on:click={loadMore}>Load more</Button> -->
  <Spinner show={loader.loading} />
 </div>
