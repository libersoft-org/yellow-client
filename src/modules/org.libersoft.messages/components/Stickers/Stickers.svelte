<script lang="ts">
	import { identifier } from '@/org.libersoft.messages/scripts/messages.js';
	import { onMount, tick } from 'svelte';
	import { updateStickerLibrary, stickerLibraryUpdaterState } from '@/org.libersoft.messages/scripts/stickers.js';
	import { debug } from '@/core/scripts/stores.ts';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	import ProgressBar from '@/core/components/ProgressBar/ProgressBar.svelte';
	import StickersFavorites from '@/org.libersoft.messages/components/Stickers/StickersFavorites.svelte';
	import StickersServer from '@/org.libersoft.messages/components/Stickers/StickersServer.svelte';
	const tabs = {
		favorites: StickersFavorites,
		server: StickersServer,
	};
	let activeTabName = $state('server');
	let view: any = $state(null);

	async function setTab(e, name) {
		activeTabName = name;
		await tick();
		view?.onShow?.();
	}

	onMount(async () => {
		await setTab(null, activeTabName);
	});

	async function clickUpdate() {
		await updateStickerLibrary();
	}
</script>

<style>
	.stickers {
		display: flex;
		flex-direction: column;
		height: calc(100% - 45px);
		overflow: hidden;
		position: relative;
		/*padding: 10px 10px 0px 10px;*/
	}

	@media (max-width: 600px) {
		.stickers {
			overflow-y: auto !important;
			display: block;
		}

		.stickers :global(.results) {
			overflow-y: hidden;
		}
	}

	.top-components {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
	}

	.stickers :global(.filter) {
		position: sticky;
		top: 10px;
		z-index: 100;
	}

	.loading {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.loading .status {
		font-size: 14px;
	}
</style>

<div class="stickers">
	<div class="top-components">
		<Tabs>
			<TabsItem img="modules/{identifier}/img/favourite.svg" onClick={e => setTab(e, 'favorites')} active={activeTabName === 'favourites'} />
			<TabsItem img="modules/{identifier}/img/server.svg" onClick={e => setTab(e, 'server')} active={activeTabName === 'server'} />
			<TabsItem img="modules/{identifier}/img/update.svg" colorVariable={$stickerLibraryUpdaterState.updating ? '--disabled-foreground' : undefined} onClick={clickUpdate} />
		</Tabs>
		{#if $debug}$stickerLibraryUpdaterState:{JSON.stringify($stickerLibraryUpdaterState)}{/if}
		{#if $stickerLibraryUpdaterState.updating}
			<div class="loading">
				<div class="status">{$stickerLibraryUpdaterState.status}</div>
				<ProgressBar value={$stickerLibraryUpdaterState.progress} moving />
			</div>
		{/if}
		{#if $stickerLibraryUpdaterState.error}
			<div class="loading">
				<Alert type="error" message={$stickerLibraryUpdaterState.status} />
			</div>
		{/if}
	</div>
	{#await tabs[activeTabName] then Component}<Component bind:this={view} />{/await}
</div>
