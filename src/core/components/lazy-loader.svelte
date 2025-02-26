<script>
 import { onMount, onDestroy } from 'svelte';
 import Spinner from './spinner.svelte';
 export let loadItems;
 export let items;
 export let contentElement;
 const threshold = 0.1;
 let hasMore = true;
 let loading = false;
 let count = 10;
 let offset = 0;
 let filters = {};
 let loaderElement;
 let _loaderIsVisible = true;
 let observer;
 let timer;
 let observing = false;

 onMount(() => {
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

 export function reload(filters_, offset_) {
  filters = filters_;
  offset = offset_;
  items = [];
  loading = false;
  hasMore = true;
  loadMore();
 }

 function loadMore() {
  if (loading || !hasMore) return;
  loading = true;
  loadItems(
   res => {
    if (res.error === false) {
     items = [...items, ...res.items];
     loading = false;
     offset += res.items.length;
     if (res.items.length < count) {
      hasMore = false;
      if (observer) observer.disconnect();
     } else {
      setTimeout(() => {
       if (isLoaderVisible()) loadMore();
      }, 500);
     }
    } else {
     console.error('Error: ' + res.message);
     loading = false;
    }
   },
   count,
   offset,
   filters
  );
 }

 function isLoaderVisible() {
  return _loaderIsVisible;
 }

 function handleIntersect(entries) {
  _loaderIsVisible = entries[entries.length - 1].isIntersecting;
  if (_loaderIsVisible && !loading && hasMore) loadMore();
 }
</script>

{#if hasMore}
 <Spinner bind:elSpinner={loaderElement} />
{/if}
