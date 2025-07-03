<script lang="ts">
	import { get } from 'svelte/store';
	import { onMount, getContext } from 'svelte';
	import { htmlEscape } from '../../messages.js';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import { isMobile } from '@/core/stores.ts';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import { gif_server } from '../../gifs.js';
	import LazyLoader from './GifSetLazyLoader.svelte';
	const MessageBar = getContext('MessageBar') as any;
	const menu = getContext('ContextMenu') as any;
	let gifs: any[] = [];
	let query = '';
	let loading = false;
	let elSearchText;
	let next_url;
	let error;
	let query_done;
	let last_query;
	let next_pos;

	export function onShow() {
		if (!get(isMobile)) {
			console.log('Focus search text');
			elSearchText.focus();
		}
	}

	onMount(() => {
		onShow();
	});

	async function searchGifs() {
		gifs = [];
		await getGifs(query, undefined);
	}

	async function moreGifs() {
		console.log('More GIFS!');
		await getGifs(null, next_pos);
	}

	async function getGifs(_query, _next_pos) {
		if (_query) last_query = _query;
		else _query = last_query;
		let server_val = get(gif_server);
		server_val = server_val.endsWith('/') ? server_val.slice(0, -1) : server_val;
		let url = `${server_val}/api/search?q=${encodeURIComponent(last_query)}&limit=12`;
		if (_next_pos) {
			url += '&pos=' + _next_pos;
		}
		loading = true;
		try {
			error = null;
			console.log('Loading GIFs from server:', url);
			const response = await fetch(url);
			console.log(response);
			if (!response.ok) {
				error = `HTTP Error: ${response.status}`;
			} else {
				query_done = true;
				const data = (await response.json()).data;
				if (!data?.results) {
					error = 'Invalid response from server.';
				} else {
					gifs = gifs.concat(data.results);
					if (data?.next) {
						next_pos = data.next;
						console.log('Next pos:', next_pos);
					}
				}
			}
		} catch (err) {
			console.error('Error while loading GIFs from server:', err);
			error = 'Error while loading GIFs from server.';
		} finally {
			loading = false;
			console.log('GIFs:', gifs);
		}
	}

	function keySearchGifs(e) {
		if (e.key === 'Enter') searchGifs();
	}

	function sendGIF(item) {
		const url = item.media_formats.gif?.url;
		MessageBar.sendMessageHtml('<Gif file="' + htmlEscape(url) + '" alt="GIF (animated picture)" ></Gif>');
		menu.close();
	}
</script>

<style>
	.gifset {
		display: flex;
		flex-direction: column;
		height: calc(100% - 45px);
	}

	.top-bar {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
		width: 100%;
	}

	/* Sticky top-bar for desktop/tablet */
	@media (min-width: 768px) {
		.top-bar {
			position: sticky;
			top: 0;
			z-index: 100;
			background-color: transparent;
		}
	}

	/* Mobile: top-bar scrolls with content */
	@media (max-width: 767px) {
		.top-bar {
			position: static;
		}
	}

	.results {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		overflow: auto;
	}

	.results-wrapper {
		width: 100%;
		justify-content: center;
		flex-wrap: wrap;
		display: flex;
		gap: 10px;
		padding: 10px;
	}

	.results img {
		width: 160px;
		height: 160px;
		object-fit: contain;
	}

	.item {
		overflow: hidden;
		border: 1px solid var(--secondary-softer-background);
		border-radius: 10px;
		background-color: var(--primary-softer-background);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.item:hover {
		z-index: 51;
		transform: scale(1.2);
		background-color: var(--primary-soft-background);
	}
</style>

<!--{JSON.stringify(gifs)}-->

<div class="gifset">
	{#if error}
		<div>{error}</div>
	{:else}
		<div class="results">
			<div class="top-bar">
				<Input icon={{ img: 'img/search.svg', alt: 'Search', onClick: searchGifs }} placeholder="Search ..." expand bind:this={elSearchText} bind:value={query} onKeydown={keySearchGifs} />
			</div>
			<div class="results-wrapper">
				{#if loading && gifs.length === 0}
					<Spinner />
				{:else if gifs.length === 0 && query_done}
					<div>No GIFs found.</div>
				{:else}
					{#each gifs as item}
						<Clickable onClick={() => sendGIF(item)}>
							<div class="item">
								<img src={item.media_formats.tinygif?.url} alt="GIF" />
							</div>
						</Clickable>
					{/each}
					{#if next_pos}
						<LazyLoader onVisible={moreGifs} />
					{/if}
					<span class="powered-by">Powered By Tenor.</span>
				{/if}
			</div>
		</div>
	{/if}
</div>
