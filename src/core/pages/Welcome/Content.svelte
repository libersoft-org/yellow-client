<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { BROWSER } from '@/core/tauri.ts';
	import { hideSidebarMobile, product, link } from '@/core/stores.ts';
	import Content from '@/core/components/Content/Content.svelte';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import VersionInfo from '@/core/components/VersionInfo/VersionInfo.svelte';
	import DialogExit from '@/core/dialogs/Exit.svelte';
	let elDialogExit: InstanceType<typeof DialogExit>;

	onMount(() => {
		if (!BROWSER) window.addEventListener('keydown', onKeydown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			if (!BROWSER) window.removeEventListener('keydown', onKeydown);
		}
	});

	async function onKeydown(event) {
		if (event.key === 'Escape') exit();
	}

	function exit() {
		elDialogExit.open();
	}

	function clickLogo() {
		window.open(link, '_blank');
	}

	function back() {
		hideSidebarMobile.set(false);
	}
</script>

<style>
	.welcome {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.logo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	.logo img {
		width: 200px;
		height: 200px;
		max-width: 100%;
		max-height: 100%;
		box-sizing: border-box;
	}

	.logo .product {
		font-size: 40px;
		font-weight: bold;
	}
</style>

<Content>
	<Bar>
		{#snippet left()}
			<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
			<BarTitle text="Welcome" />
		{/snippet}
		{#if !BROWSER}
			{#snippet right()}
				<Icon img="img/cross.svg" onClick={exit} colorVariable="--secondary-foreground" visibleOnMobile={false} />
			{/snippet}
		{/if}
	</Bar>
	<Page hAlign="center" vAlign="center">
		<div class="welcome">
			<Clickable onClick={clickLogo}>
				<div class="logo">
					<img src="img/logo.svg" alt={product} />
					<div class="product">{product}</div>
				</div>
			</Clickable>
			<VersionInfo className="centered" />
		</div>
	</Page>
</Content>
<DialogExit bind:this={elDialogExit} />
