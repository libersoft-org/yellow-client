<script>
	import { debug } from '@/core/stores.ts';
	import { rgi, emoji_render } from '../../emojis.js';
	import { expressions_renderer, animate_all_expressions } from '../../expressions.svelte.ts';
	import { emojisByCodepointsRgi } from '../../messages.js';
	import Sticker from '../Stickers/Sticker.svelte';
	export let codepoints;
	export let size = 40;
	export let is_single = false;
	export let context;
	export let force_animate = false;
	let codepoints_rgi = rgi(codepoints);
	let is_mouse_over;
	let is_animated;
	let url;

	$: is_animated = $emojisByCodepointsRgi?.[codepoints_rgi]?.animated;
	$: update_url(context, is_mouse_over, codepoints_rgi, !$animate_all_expressions, $expressions_renderer);

	function update_url(context, is_mouse_over, codepoints_rgi, render_emojis_as_static, expressions_renderer) {
		let raster = expressions_renderer !== 'svg';
		//console.log('update_url:', context, is_mouse_over, codepoints_rgi, render_emojis_as_static, raster);
		url = 'https://fonts.gstatic.com/s/e/notoemoji/latest/' + codepoints_rgi + '/';
		if (context === 'message') {
			let animate = (is_mouse_over || (!render_emojis_as_static && force_animate)) && is_animated;
			if (animate) url += raster ? '512.webp' : 'lottie.json';
			else url += raster ? '512.png' : 'emoji.svg';
		} else if (context === 'menu') {
			let animate = is_animated;
			if (animate) url += 'lottie.json';
			else url += 'emoji.svg';
		}
		//console.log('update_url:', url);
	}
</script>

<style>
	img {
		object-fit: contain;
	}
</style>

{#if $debug}
	<pre>
 codepoints:{JSON.stringify(codepoints)}
 codepoints_rgi:{codepoints_rgi}
 is_single:{is_single}
 size:{size}
 is_animated:{is_animated}
 url:{url}
 </pre>
{/if}

{#if url.endsWith('/lottie.json')}
	<Sticker file={url} {size} {force_animate} />
{:else}
	<img style="{!is_single && 'padding: 0 2px;'} min-width: {size}px; min-height: {size}px; max-width: {size}px; max-height: {size}px;" loading="lazy" alt={emoji_render(codepoints)} src={url} onMouseOver={() => (is_mouse_over = true)} onMouseOut={() => (is_mouse_over = false)} />
{/if}
