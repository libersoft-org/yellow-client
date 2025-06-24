<script>
	import Label from '@/core/components/Label/Label.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import { sticker_server_index, sticker_servers } from '../../stickers.js';
	import { gif_server_index, gif_servers } from '../../gifs.js';
	import { expressions_renderer, animate_all_expressions } from '../../expressions.svelte.ts';
	import DialogDeleteStickers from '../../dialogs/DeleteStickers.svelte';
	import ModalStickerServers from '../../modals/StickerServers.svelte';
	import ModalGifServers from '../../modals/GifServers.svelte';
	let elModalStickerServers;
	let elModalGifServers;
	let elDialogDeleteStickers;
	let showAsVector = $expressions_renderer === 'svg';
	let animateAll = $animate_all_expressions;
	$: showAsVector !== undefined && expressions_renderer.set(showAsVector ? 'svg' : 'canvas');
	$: animateAll !== undefined && animate_all_expressions.set(animateAll);

	function clickManageStickerServers() {
		elModalStickerServers?.open();
	}

	function clickManageGifServers() {
		elModalGifServers?.open();
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

<div class="settings">
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
	<Button img="img/edit.svg" text="Manage gif servers" onClick={clickManageGifServers} />
</div>
<DialogDeleteStickers bind:this={elDialogDeleteStickers} />
<Modal title="Manage sticker servers" body={ModalStickerServers} bind:this={elModalStickerServers} width="400px" />
<Modal title="Manage GIF servers" body={ModalGifServers} bind:this={elModalGifServers} width="400px" />
