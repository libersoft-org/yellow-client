<script lang="ts">
	let { items, item_slot } = $props();
	let observer: IntersectionObserver | undefined;
	let itemsEls: HTMLDivElement[] = $state([]);
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
		observer = new IntersectionObserver(intersecting, { threshold: 0.01 });
		itemsEls.forEach(itemEl => {
			if (itemEl && observer) observer.observe(itemEl);
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
		<div style="min-height: {200}px;">
			<!--{#if visibility[item.id]}-->
			{@render item_slot(item, visibility[item.id] ? true : false)}
			<!--{/if}-->
		</div>
	</div>
{/each}
