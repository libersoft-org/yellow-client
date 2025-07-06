<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { product, link } from '@/core/scripts/stores.ts';
	import { BROWSER } from '@/core/scripts/tauri.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import MenuItem from '@/core/components/Menu/MenuItem.svelte';
	import Settings from '@/core/modals/Settings/Settings.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import DialogExit from '@/core/dialogs/Exit.svelte';
	import VersionInfo from '@/core/components/VersionInfo/VersionInfo.svelte';
	import { isDarkMode, toggleDarkMode } from '@/core/scripts/themes.ts';
	interface Props {
		showMenu: boolean;
	}
	let { showMenu = $bindable(false) }: Props = $props();
	let elSettings: Settings;
	let elDialogExit: InstanceType<typeof DialogExit>;
	let darkModeLocal = $state(false);

	onMount(() => {
		window.addEventListener('keydown', onKeydown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown);
	});

	function onKeydown(event) {
		if (event.key === 'Escape' && showMenu) {
			event.stopImmediatePropagation();
			event.preventDefault();
			//TODO: - deny closing everything else than menu !!!
			clickMenuClose();
		}
	}

	// Sync darkModeLocal with isDarkMode store
	$effect(() => {
		darkModeLocal = $isDarkMode;
	});

	// Update theme when darkModeLocal changes
	$effect(() => {
		toggleDarkMode(darkModeLocal);
	});

	const menuItems = [
		{
			title: 'Donate',
			img: 'img/donate.svg',
			onClick: () => openPage('https://libersoft.org/donations'),
			testId: 'menu-item-donate',
		},
		{
			title: 'Contact developers',
			img: 'img/contact.svg',
			onClick: () => openPage('https://libersoft.org/contacts'),
			testId: 'menu-item-contact',
		},
		{
			title: 'Settings',
			img: 'img/settings.svg',
			onClick: clickSettings,
			testId: 'menu-item-settings',
		},
	].concat(
		BROWSER
			? []
			: [
					{
						title: 'Exit application',
						img: 'img/exit.svg',
						onClick: exitApp,
						testId: 'menu-item-exit',
					},
				]
	);

	function clickMenuClose() {
		showMenu = false;
	}

	function openPage(url) {
		window.open(url, '_blank');
		clickMenuClose();
	}

	function clickSettings() {
		elSettings?.open();
		clickMenuClose();
	}

	function exitApp() {
		elDialogExit?.open();
		clickMenuClose();
	}
</script>

<style>
	.overlay {
		z-index: 200;
		position: fixed;
		display: none;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.85);
	}

	.overlay.open {
		display: block;
	}

	.menu {
		z-index: 201;
		position: fixed;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		top: 0;
		left: 0;
		width: 250px;
		height: 100%;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
		box-shadow: var(--shadow);
		transform: translateX(-100%);
		transition:
			transform 0.3s ease,
			visibility 0s 0.3s;
		visibility: hidden;
	}

	.menu > div:first-child {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.menu.open {
		transform: translateX(0);
		transition:
			transform 0.3s ease,
			visibility 0s;
		visibility: visible;
	}

	.header {
		display: flex;
		border-bottom: 1px solid var(--secondary-softer-background);
	}

	.items {
		overflow: auto;
		flex: 1;
		min-height: 0;
	}

	.footer {
		display: flex;
		flex-direction: column;
	}

	.footer .section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border-top: 1px solid var(--secondary-softer-background);
	}

	.footer .section .logo {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		font-size: 22px;
		font-weight: bold;
	}

	.footer .section :global(.menu-version-info .version) {
		justify-content: center;
		font-size: 14px;
	}
</style>

{#if showMenu}
	<div class="overlay open" role="none" onclick={clickMenuClose}></div>
{/if}
<div class="menu {showMenu ? 'open' : ''}">
	<div>
		<div class="header">
			<Icon img="img/cross.svg" alt="X" colorVariable="--secondary-foreground" size="30px" padding="15px" onClick={clickMenuClose} />
		</div>
		<div class="items">
			{#each menuItems as item}
				<MenuItem testId={item.testId} img={item.img} title={item.title} onClick={item.onClick} />
			{/each}
		</div>
	</div>
	<div class="footer">
		<div class="section">
			<Switch showLabel label="Dark mode" bind:checked={darkModeLocal} />
		</div>
		<div class="section">
			<Clickable onClick={() => openPage(link)}>
				<div class="logo">
					<Icon img="img/logo.svg" alt={product} size="30px" padding="0px" />
					<div>{product}</div>
				</div>
			</Clickable>
			<VersionInfo className="menu-version-info" />
		</div>
	</div>
</div>
<Settings testId="global-settings" bind:this={elSettings} />
<DialogExit bind:this={elDialogExit} />
