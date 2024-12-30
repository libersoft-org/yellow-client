<script>
 import { onMount } from 'svelte';

 let { items } = $props();

 let observer;
 let container;
 let itemsEls = [];

 onMount(async () => {
  observer = new IntersectionObserver(
   entries => {
    entries.forEach(entry => {
     if (entry.isIntersecting) {
      console.log('Intersecting');
     }
    });
   },
   {
    threshold: 0.1,
    delay: 10,
   }
  );

  setInterval(() => {
   console.log('itemsEls:', itemsEls);
  }, 4000);
 });

 /*
 $effect(async () => {
  await tick();
  for (let item of items) {
   observer.observe(item);
  }
 });
*/
</script>

<div class="intersector" bind:this={container}>
 {#each items as item, i (item.id)}
  <div
   class="item"
   bind:this={el => {
    itemsEls[i] = el;
   }}
  ></div>
  <slot {item} />
 {/each}
</div>
