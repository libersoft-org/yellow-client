<script>
	import { get } from 'svelte/store';
	import { onMount, getContext } from 'svelte';
	import { htmlEscape } from '../../messages.js';
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import { isMobile } from '@/core/core.js';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import { gif_server } from '../../gifs.js';
	import LazyLoader from '@/core/components/Spinner/LazyLoader.svelte';

	const MessageBar = getContext('MessageBar');
	const menu = getContext('ContextMenu');

	let gifs = [];
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
		await getGifs(query);
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
		menu?.close();
	}
</script>

<!--{JSON.stringify(gifs)}-->

<div class="gifset">
	<div class="top-bar">
		<div class="group">
			<Input
				placeholder="Search GIFs"
				grow={true}
				bind:this={elSearchText}
				bind:value={query}
				onKeydown={keySearchGifs}
			/>
			<Button text="Search" width="80px" onClick={searchGifs} />
		</div>
	</div>
	{#if error}
		<div>{error}</div>
	{:else}
		<div class="results">
			{#if loading && gifs.length === 0}
				<Spinner />
			{:else if gifs.length === 0 && query_done}
				<div>No GIFs found.</div>
			{:else}
				{#each gifs as item}
					<BaseButton onClick={() => sendGIF(item)}>
						<div class="item">
							<img src={item.media_formats.tinygif?.url} alt="GIF" />
						</div>
					</BaseButton>
				{/each}
				{#if next_pos}
					<LazyLoader onVisible={moreGifs} />
				{/if}
				Powered By Tenor.
			{/if}
		</div>
	{/if}
</div>

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
	}

	.group {
		display: flex;
		gap: 10px;
	}

	.results {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 10px;
		overflow: auto;
		padding: 10px;
	}

	.results img {
		width: 160px;
		height: 160px;
		object-fit: contain;
	}

	.item {
		border: 1px solid #ccc;
		border-radius: 10px;
		overflow: hidden;
		background-color: #eee;
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.item:hover {
		z-index: 90;
		transform: scale(1.2);
	}
</style>
