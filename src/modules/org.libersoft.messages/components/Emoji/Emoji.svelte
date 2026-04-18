<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { rgi, emoji_render } from '@/org.libersoft.messages/scripts/emojis.ts';
	import { expressions_renderer, animate_all_expressions } from '@/org.libersoft.messages/scripts/expressions.svelte.ts';
	import { emojisByCodepointsRgi } from '@/org.libersoft.messages/scripts/messages.ts';
	import Sticker from '@/org.libersoft.messages/components/Stickers/Sticker.svelte';

	interface Props {
		codepoints: any;
		size?: number;
		is_single?: boolean;
		context?: string;
		force_animate?: boolean;
	}

	let { codepoints, size = 40, is_single = false, context, force_animate = false }: Props = $props();
	let codepoints_rgi = $derived(rgi(codepoints));
	let is_mouse_over = $state(false);

	let is_animated = $derived($emojisByCodepointsRgi?.[codepoints_rgi]?.animated);
	let url = $derived.by((): string => {
		let raster = $expressions_renderer !== 'svg';
		//console.log('update_url:', context, is_mouse_over, codepoints_rgi, render_emojis_as_static, raster);
		let base = 'https://fonts.gstatic.com/s/e/notoemoji/latest/' + codepoints_rgi + '/';
		if (context === 'message') {
			let animate = (is_mouse_over || ($animate_all_expressions && force_animate)) && is_animated;
			if (animate) return base + (raster ? '512.webp' : 'lottie.json');
			else return base + (raster ? '512.png' : 'emoji.svg');
		} else if (context === 'menu') {
			let animate = is_animated;
			if (animate) return base + 'lottie.json';
			else return base + 'emoji.svg';
		}
		//console.log('update_url:', url);
		return base;
	});
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
	<Sticker file={url} {size} {force_animate} intersecting={true} />
{:else}
	<img style="{!is_single && 'padding: 0 2px;'} min-width: {size}px; min-height: {size}px; max-width: {size}px; max-height: {size}px;" loading="lazy" alt={emoji_render(codepoints)} src={url} onmouseover={() => (is_mouse_over = true)} onmouseout={() => (is_mouse_over = false)} onfocus={() => (is_mouse_over = true)} onblur={() => (is_mouse_over = false)} role="presentation" />
{/if}
