<script lang="ts">
	import Label from '@/core/components/Label/Label.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Window from '@/core/components/Window/Window.svelte';
	import { sticker_server_index, sticker_servers } from '@/org.libersoft.messages/scripts/stickers.ts';
	import { gif_server_index, gif_servers } from '@/org.libersoft.messages/scripts/gifs.ts';
	import { expressions_renderer, animate_all_expressions } from '@/org.libersoft.messages/scripts/expressions.svelte.ts';
	import DialogDeleteStickers from '@/org.libersoft.messages/dialogs/DeleteStickers.svelte';
	import WindowStickerServers from '@/org.libersoft.messages/windows/StickerServers.svelte';
	import WindowGifServers from '@/org.libersoft.messages/windows/GifServers.svelte';
	let elWindowStickerServers: any;
	let elWindowGifServers: any;
	let elDialogDeleteStickers: any;
	let showAsVector = $state($expressions_renderer === 'svg');
	let animateAll = $state($animate_all_expressions);
	let _syncVector = $derived.by((): boolean => {
		const v = showAsVector;
		if (v !== undefined) queueMicrotask(() => expressions_renderer.set(v ? 'svg' : 'canvas'));
		return true;
	});
	let _syncAnimate = $derived.by((): boolean => {
		const v = animateAll;
		if (v !== undefined) queueMicrotask(() => animate_all_expressions.set(v));
		return true;
	});

	function clickManageStickerServers() {
		elWindowStickerServers?.open();
	}

	function clickManageGifServers() {
		elWindowGifServers?.open();
	}

	function clickDeleteStickersDatabase() {
		elDialogDeleteStickers?.open();
	}
</script>

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
	}
</style>

<div class="settings" data-sync-vector={_syncVector || undefined} data-sync-animate={_syncAnimate || undefined}>
	<Switch label="Show expressions as vector (slower, nicer)" bind:checked={showAsVector} showLabel row />
	<Switch label="Animate all expressions" bind:checked={animateAll} showLabel row />
	<Label text="Sticker server">
		<Select bind:value={$sticker_server_index}>
			{#each $sticker_servers as server, i}
				<Option value={i} text={server} />
			{/each}
		</Select>
	</Label>
	<ButtonBar expand>
		<Button img="img/edit.svg" text="Manage sticker servers" onClick={clickManageStickerServers} />
		<Button img="img/del.svg" text="Delete stickers database" onClick={clickDeleteStickersDatabase} />
	</ButtonBar>
	<Label text="Gif server">
		<Select bind:value={$gif_server_index}>
			{#each $gif_servers as server, i}
				<Option value={i} text={server} />
			{/each}
		</Select>
	</Label>
	<Button img="img/edit.svg" text="Manage GIF servers" onClick={clickManageGifServers} />
</div>
<DialogDeleteStickers bind:this={elDialogDeleteStickers} />
<Window title="Manage sticker servers" body={WindowStickerServers} bind:this={elWindowStickerServers} width="400px" />
<Window title="Manage GIF servers" body={WindowGifServers} bind:this={elWindowGifServers} width="400px" />
