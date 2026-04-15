<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Sticker from './Sticker.svelte';
	import { getContext } from 'svelte';
	import { htmlEscape } from '@/org.libersoft.messages/scripts/messages.ts';

	interface Props {
		sticker: any;
		stickerset: any;
		intersecting: boolean;
		size: number;
	}

	let { sticker, stickerset, intersecting, size }: Props = $props();
	const MessagesContext: any = getContext('MessagesContext');
	const popup: any = getContext('Popup');
	let file = $derived(sticker.url);

	async function handleClick(): Promise<void> {
		console.log('stickerset-item handleClick file:', file, 'sticker:', sticker);
		await MessagesContext.messageBar.doSendMessage('<Sticker file="' + htmlEscape(file) + '" set="' + htmlEscape(stickerset.url) + '" ></Sticker>', true);
		popup.close();
	}

	function onMousedown(event: MouseEvent): void {
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

	.sticker:hover,
	:global(.clickable:focus-visible) .sticker,
	:global(.clickable.focused) .sticker {
		z-index: 51;
		transform: scale(1.2);
		background-color: var(--primary-soft-background);
		box-shadow: var(--shadow);
	}
</style>

{#if file}
	<Clickable onClick={handleClick} {onMousedown}>
		<div class="sticker" style="max-width: {size}px;">
			<Sticker {size} {file} force_animate={false} {intersecting} />
		</div>
	</Clickable>
{/if}
