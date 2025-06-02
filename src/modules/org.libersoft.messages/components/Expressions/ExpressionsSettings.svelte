<script>
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import { sticker_server_index, sticker_servers } from '../../stickers.js';
	import { gif_server_index, gif_servers } from '../../gifs.js';
	import { expressions_renderer, animate_all_expressions } from '../../expressions.svelte.ts';
	import StickerServers from '../../modals/StickerServers.svelte';
	import GifServers from '../../modals/GifServers.svelte';
	import { stickers_db } from '../../db.ts';
	let isModalStickerServersOpen = false;
	let isModalGifServersOpen = false;
	let showAsVector = $expressions_renderer === 'svg';
	let animateAll = $animate_all_expressions;
	$: showAsVector !== undefined && expressions_renderer.set(showAsVector ? 'svg' : 'canvas');
	$: animateAll !== undefined && animate_all_expressions.set(animateAll);

	function clickManageStickerServers() {
		console.log('Click: Manage sticker servers');
		isModalStickerServersOpen = !isModalStickerServersOpen;
	}
	function clickManageGifServers() {
		console.log('Click: Manage gif servers');
		isModalGifServersOpen = !isModalGifServersOpen;
	}
</script>

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
	}

	.group {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.group .label {
		font-size: 14px;
		flex-grow: 1;
	}
</style>

<div class="settings">
	<div class="group">
		<div class="label">Show expressions as vector (slower, nicer):</div>
		<Switch label="Show expressions as vector (slower, nicer)" bind:checked={showAsVector} />
	</div>
	<div class="group">
		<div class="label">Animate all expressions:</div>
		<Switch label="Animate all expressions" bind:checked={animateAll} />
	</div>
	<div class="group">
		<div class="label">Sticker server:</div>
		<Select bind:value={$sticker_server_index}>
			{#each $sticker_servers as server, i}
				<Option value={i} text={server} />
			{/each}
		</Select>
	</div>
	<Button text="Manage sticker servers" onClick={clickManageStickerServers} />
	<Button
		text="Delete stickers database"
		onClick={() => {
			stickers_db.delete();
		}}
	/>

	<div class="group">
		<div class="label">Gif server:</div>
		<Select bind:value={$gif_server_index}>
			{#each $gif_servers as server, i}
				<Option value={i} text={server} />
			{/each}
		</Select>
	</div>
	<Button text="Manage gif servers" onClick={clickManageGifServers} />
</div>
<Modal title="Manage sticker servers" body={StickerServers} bind:show={isModalStickerServersOpen} width="400px" />
<Modal title="Manage gif servers" body={GifServers} bind:show={isModalGifServersOpen} width="400px" />
