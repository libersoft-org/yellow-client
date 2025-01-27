<script>
 let { items, item_slot } = $props();
 let observer;
 let itemsEls = $state([]);
 let itemsById = {};
 let heights = {};
 let visibility = $state({});

 $effect(() => {
  itemsById = {};
  items.forEach(item => {
   itemsById[item.id] = item;
  });
  update_observers(itemsEls);
 });

 function update_observers(itemsEls) {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(intersecting, { threshold: 0.1, delay: 10 });
  itemsEls.forEach(itemEl => {
   if (itemEl) observer.observe(itemEl);
  });
 }

 function intersecting(entries) {
  setTimeout(() => {
   entries.forEach(entry => {
    entry.target.dataset.intersecting = entry.isIntersecting;
    let n = Number(entry.target.dataset.id);
    //console.log('n:', n, 'entry.target.dataset.id:', entry.target.dataset.id, 'intersection:', entry.isIntersecting);
    //itemsById[n]._intersecting = entry.isIntersecting;
    visibility[n] = entry.isIntersecting;
    //visibility[entry.target.dataset.id] = entry.isIntersecting;
   });
  }, 60);
 }
</script>

{#each items as item, i (item.id)}
 <div class="item" data-id={item.id} bind:this={itemsEls[i]}>
  <!--
  {JSON.stringify(typeof item.id)}
  {JSON.stringify(item.id)}
  {JSON.stringify(visibility[item.id])}
   -->
  <div style="min-height: {heights[item.id] || 200}px;">
   <!-- background-color: #19f; border-radius: 10px;-->
   {#if visibility[item.id]}
    {@render item_slot(item, heights[item.id])}
   {/if}
  </div>
 </div>
{/each}
