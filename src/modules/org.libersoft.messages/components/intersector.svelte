<script>
 let { items } = $props();

 let observer;
 let container;
 let itemsEls = [];
 let itemsById = {};

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
  entries.forEach(entry => {
   //console.log(entry.target);
   let item = itemsById[entry.target.dataset.item];
   if (item) {
    console.log('intersecting', item.id, entry.isIntersecting);
    item._intersecting = entry.isIntersecting;
   }
  });
 }
</script>

<style>
 .intersector {
  display: flex;
  flex-direction: column;
  gap: 15px;
 }
</style>

<div class="intersector" bind:this={container}>
 {#each items as item, i (item.id)}
  <div data-item={item.id} class="item" bind:this={itemsEls[i]}>
   {#if item._intersecting}
    <slot {item} intersecting={item._intersecting} />
   {:else}
    nnn
   {/if}
  </div>
 {/each}
</div>
