<script>
 import { writable } from 'svelte/store';

 let { items } = $props();

 let observer;
 let container;
 let itemsEls = [];
 let itemsById = {};
 let visibility = writable({});

 $effect(() => {
  itemsById = {};
  items.forEach(item => {
   itemsById[item.id] = item;
  });
  update_observers(itemsEls);
 });

 function update_observers(itemsEls) {
  if (observer) {
   observer.disconnect();
  }
  observer = new IntersectionObserver(intersecting, { threshold: 0.1, delay: 10 });
  itemsEls.forEach(itemEl => {
   observer.observe(itemEl);
  });
 }

 function intersecting(entries) {
  setTimeout(() => {
   entries.forEach(entry => {
    entry.target.dataset.intersecting = entry.isIntersecting;
    let n = Number(entry.target.dataset.id);
    console.log('n:', n, 'entry.target.dataset.id:', entry.target.dataset.id, 'intersection:', entry.isIntersecting);
    //itemsById[n]._intersecting = entry.isIntersecting;
    visibility.update(x => {
     x[n] = entry.isIntersecting;
     return x;
    });
    //visibility[entry.target.dataset.id] = entry.isIntersecting;
   });
  }, 60);
 }
</script>

<style>
 .intersector {
  display: flex;
  flex-direction: column;
  gap: 15px;
 }
</style>

{JSON.stringify($visibility)}
<div class="intersector" bind:this={container}>
 {#each items as item, i (item.id)}
  <div class="item" data-id={item.id} bind:this={itemsEls[i]}>
   <!--
   {JSON.stringify(typeof item.id)}
   {JSON.stringify(item.id)}
   {JSON.stringify($visibility[item.id])}
-->

   {#if $visibility[item.id]}
    <slot {item} intersecting={true} />
   {:else}
    <div style="height: 100px; background-color: #ddd; border-radius: 10px;"></div>
   {/if}
  </div>
 {/each}
</div>
