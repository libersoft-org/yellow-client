<script>
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Sticker from './Sticker.svelte';
	import { getContext } from 'svelte';
	import { htmlEscape } from '../../messages.js';
	import StickerSetPart from './StickerSetPart.svelte';
	export let sticker;
	export let stickerset;
	export let intersecting;
	export let size;
	const MessagesContext = getContext('MessagesContext');
	const popup = getContext('Popup');
	let file;

	$: file = sticker.url;

	async function handleClick() {
		console.log('stickerset-item handleClick file:', file, 'sticker:', sticker);
		await MessagesContext.messageBar.doSendMessage('<Sticker file="' + htmlEscape(file) + '" set="' + htmlEscape(stickerset.url) + '" ></Sticker>', true);
		popup.close();
	}

	function onMousedown(event) {
		console.log('sticker-set-item mousedown');
		event.preventDefault();
		event.stopPropagation();
	}
</script>

<style>
	.sticker {
		display: inline-block;
		padding: 5px;
		border-radius: 10px;
		background-color: var(--primary-softer-background);
		border: 1px solid var(--secondary-softer-background);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.sticker:hover {
		z-index: 51;
		transform: scale(1.2);
		background-color: var(--primary-soft-background);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
	}
</style>

{#if file}
	<Clickable onClick={handleClick} {onMousedown}>
		<div class="sticker" style="max-width: {size}px;">
			<Sticker {size} {file} play_on_start={false} {intersecting} />
		</div>
	</Clickable>
{/if}
