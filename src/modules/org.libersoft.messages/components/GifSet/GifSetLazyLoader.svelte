<script lang="ts">
	import { onMount, onDestroy, tick, getContext } from 'svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	export let onVisible;
	const threshold = 0.1;
	let loading: boolean = false;
	let loaderElement;
	let _loaderIsVisible: boolean = true;
	let observer;
	let timer;
	let observing: boolean = false;
	let contentElement = getContext('contentElement');

	onMount(async () => {
		await tick();
		observer = new IntersectionObserver(handleIntersect, { threshold, root: contentElement });
		observer.observe(loaderElement);
	});

	onDestroy(() => {
		if (observer) observer.disconnect();
		if (timer) clearTimeout(timer);
	});

	async function loadMore() {
		if (loading) return;
		loading = true;
		await onVisible();
		loading = false;
	}

	function handleIntersect(entries) {
		console.log('handleIntersect', entries);
		_loaderIsVisible = entries[entries.length - 1].isIntersecting;
		if (_loaderIsVisible) loadMore();
	}
</script>

<div bind:this={loaderElement}>
	<Spinner bind:show={loading} />
</div>
