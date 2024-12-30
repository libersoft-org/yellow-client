<script>
 import { tick } from 'svelte';

 let {
  items,
  //  scroll_to_top = $bindable(),
 } = $props();

 let observer;
 let container;
 let itemsEls = [];
 let itemsById = {};
 let visibility = $state({});

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
    visibility[n] = entry.isIntersecting;
    //visibility[entry.target.dataset.id] = entry.isIntersecting;
   });
  }, 60);
 }

 export async function scroll_to_top() {
  await tick();
  console.log('cmpIntersector scroll_to_top');
  setTimeout(() => {
   console.log('container.scrollTop:', container.scrollTop);
   container.scrollTop = 0;
   console.log('container.scrollTop:', container.scrollTop);
  }, 1000);
  //container.scrollTop = 0;
 }
</script>

<style>
 .intersector {
  display: flex;
  flex-direction: column;
  gap: 15px;
 }
</style>

<!--
{JSON.stringify(visibility)}
-->

<div class="intersector" bind:this={container}>
 {#each items as item, i (item.id)}
  <div class="item" data-id={item.id} bind:this={itemsEls[i]}>
   <!--
   {JSON.stringify(typeof item.id)}
   {JSON.stringify(item.id)}
   {JSON.stringify(visibility[item.id])}
-->
   {#if visibility[item.id]}
    <slot {item} />
   {:else}
    <div style="height: 300px; background-color: #ddd; border-radius: 10px;"></div>
   {/if}
  </div>
 {/each}
</div>
