<script lang="ts">
	import { identifier } from '../../messages.js';
	import Emojis from '../Emoji/Emojis.svelte';
	import Stickers from '../Stickers/Stickers.svelte';
	import GifSet from '../GifSet/GifSet.svelte';
	import ExpressionsItem from './ExpressionsItem.svelte';
	import ExpressionsSettings from './ExpressionsSettings.svelte';
	import { onMount, tick } from 'svelte';
	interface Props {
		height?: string;
	}
	let { height }: Props = $props();
	const expressions = {
		emojis: Emojis,
		stickers: Stickers,
		gifs: GifSet,
		settings: ExpressionsSettings,
	};
	let expression = $state('emojis');
	let Expression = $derived(expressions[expression]);
	let elExpression;

	export async function setCategory(e, name) {
		expression = name;
		e?.stopPropagation();
		e?.preventDefault();
		await currentTabOnShow();
	}

	onMount(async () => {
		await currentTabOnShow();
	});

	async function currentTabOnShow() {
		await tick();
		console.log('currentTabOnShow:', expression);
		elExpression?.onShow?.();
	}
</script>

<style>
	.expressions {
		overflow: hidden;
	}

	.categories {
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		background-color: var(--primary-background);
		height: 45px;
		max-height: 45px;
	}
</style>

<div class="expressions" style="height: {height}">
	<div class="categories" role="none">
		<ExpressionsItem label="Emojis" icon="modules/{identifier}/img/emoji.svg" active={expression === 'emojis'} onClick={e => setCategory(e, 'emojis')} mobileNoText />
		<ExpressionsItem label="Stickers" icon="modules/{identifier}/img/sticker.svg" active={expression === 'stickers'} onClick={e => setCategory(e, 'stickers')} mobileNoText />
		<ExpressionsItem label="GIFs" icon="modules/{identifier}/img/gif.svg" active={expression === 'gifs'} onClick={e => setCategory(e, 'gifs')} mobileNoText />
		<ExpressionsItem label="Settings" icon="img/settings.svg" active={expression === 'settings'} onClick={e => setCategory(e, 'settings')} mobileNoText />
	</div>
	<!--<svelte:component this={expressions[expression]} bind:this={elExpression} />-->
	<Expression bind:this={elExpression} />
</div>
