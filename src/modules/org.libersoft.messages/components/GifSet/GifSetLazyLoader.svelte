<script lang="ts">
	import { onMount, onDestroy, tick, getContext } from 'svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	interface Props {
		onVisible: () => Promise<void>;
	}
	let { onVisible }: Props = $props();
	const threshold = 0.1;
	let loading: boolean = $state(false);
	let loaderElement: HTMLDivElement;
	let _loaderIsVisible: boolean = true;
	let observer: IntersectionObserver;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let contentElement = getContext('contentElement') as Element | null;

	onMount(async () => {
		await tick();
		observer = new IntersectionObserver(handleIntersect, { threshold, root: contentElement });
		observer.observe(loaderElement);
	});

	onDestroy(() => {
		if (observer) observer.disconnect();
		if (timer) clearTimeout(timer);
	});

	async function loadMore(): Promise<void> {
		if (loading) return;
		loading = true;
		await onVisible();
		loading = false;
	}

	function handleIntersect(entries: IntersectionObserverEntry[]): void {
		console.log('handleIntersect', entries);
		const lastEntry = entries[entries.length - 1];
		if (!lastEntry) return;
		_loaderIsVisible = lastEntry.isIntersecting;
		if (_loaderIsVisible) loadMore();
	}
</script>

<div bind:this={loaderElement}>
	<Spinner show={loading} />
</div>
