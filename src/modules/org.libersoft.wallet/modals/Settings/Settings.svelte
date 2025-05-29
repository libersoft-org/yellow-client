<script lang="ts">
	import MenuItem from '@/core/components/Menu/MenuItem.svelte';
	import SectionGeneral from './SettingsGeneral.svelte';
	import SectionNetworks from './SettingsNetworks.svelte';
	import SectionWallets from './SettingsWallets.svelte';
	import SectionAddressBook from './SettingsAddressbook.svelte';
	import { fade } from 'svelte/transition';
	import Icon from '@/core/components/Icon/Icon.svelte';

	type Props = {
		activeTab?: string;
	};

	let { activeTab = $bindable('general') }: Props = $props();

	let menuItemProps = {
		bgColor: '#fff',
		textColor: '#000',
		hoverColor: '#eee',
		borderTop: '1px solid #888',
		borderBottom: '1px solid #888',
		borderLeft: '1px solid #888',
		borderRight: '1px solid #888',
		borderRadius: '10px',
	};

	let menuItems = [
		{
			title: 'General',
			tab: 'general',
			img: 'img/settings.svg',
			onClick: () => setItem('general'),
		},
		{
			title: 'Networks',
			tab: 'networks',
			img: 'img/settings.svg',
			onClick: () => setItem('networks'),
		},
		{
			title: 'Wallets',
			tab: 'wallets',
			img: 'img/settings.svg',
			onClick: () => setItem('wallets'),
		},
		{
			title: 'Address book',
			tab: 'address_book',
			img: 'img/settings.svg',
			onClick: () => setItem('address_book'),
		},
	];

	function setItem(name: string) {
		activeTab = name;
	}
</script>

{#snippet breadcrumbs(menuItems: any[])}
	{#if activeTab !== ''}
		<div class="breadcrumbs" in:fade={{ duration: 400 }}>
			<button onclick={() => setItem('')}>
				<Icon img="img/home.svg" alt="Settings" colorVariable="--icon-white" size="16px" />
				Wallet Settings
			</button>
			<span>
				{#each menuItems as item}
					{#if item.tab === activeTab}
						{item.title}
					{/if}
				{/each}
			</span>
		</div>
	{/if}
	{#each menuItems as item}
		{#if activeTab === ''}
			<MenuItem img={item.img} title={item.title} colorVariable="--icon-black" bgColor={menuItemProps.bgColor} textColor={menuItemProps.textColor} hoverColor={menuItemProps.hoverColor} borderTop={menuItemProps.borderTop} borderBottom={menuItemProps.borderBottom} borderLeft={menuItemProps.borderLeft} borderRight={menuItemProps.borderRight} borderRadius={menuItemProps.borderRadius} onClick={() => setItem(item.tab)} />
		{/if}
	{/each}
{/snippet}

<div class="settings-container">
	{@render breadcrumbs(menuItems)}

	<div class="tab-content">
		{#if activeTab === 'general'}
			<SectionGeneral />
		{:else if activeTab === 'networks'}
			<SectionNetworks />
		{:else if activeTab === 'wallets'}
			<SectionWallets />
		{:else if activeTab === 'address_book'}
			<SectionAddressBook />
		{/if}
	</div>
</div>

<style>
	.settings-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.tab-content {
		display: flex;
		flex-direction: column;
		gap: 10px;
		&:empty {
			display: none;
		}
	}

	.breadcrumbs {
		display: flex;
		padding: 8px 10px;
		background: hsl(345, 6%, 13%);
		margin-bottom: 0px;
		border-radius: 10px;

		span,
		button {
			border: none;
			background: none;
			font-size: 14px;
			font-weight: bold;
			padding: 0;
			transition: color 0.3s ease;
			cursor: default;
			text-transform: capitalize;

			&:hover {
				color: white;
			}

			&:not(:first-child)::before {
				content: '>';
				margin: 0 5px;
				color: white;
			}

			&:last-child {
				color: white;
			}
		}

		button {
			cursor: pointer;
			display: flex;
			gap: 6px;
			color: white;
			filter: contrast(0.5);
			transition: filter 0.3s ease;

			&:hover {
				filter: contrast(1);
			}

			:global(.icon) {
				padding: 0 !important;
			}
		}
	}
</style>
