<script lang="ts">
	import { fade } from 'svelte/transition';
	import Icon from '../Icon/Icon.svelte';
	import MenuItem from '../Menu/MenuItem.svelte';

	/* todo, refactor with Button.svelte ? */

	// import BaseButton from '@/core/components/Button/BaseButton.svelte';
	// import { autoPlacement, autoUpdate, computePosition, offset, shift } from '@floating-ui/dom';
	// import Portal from '@/core/components/Portal/Portal.svelte';

	type Props = {
		activeTab?: string;
		menuItems?: Array<any>;
		root_crumb?: string;
	};
	// let {  } = $props();

	let { root_crumb, activeTab = $bindable(), menuItems = [] }: Props = $props();

	let items;

	function setItem(name: string) {
		activeTab = name;
	}
</script>

<style>
	.breadcrumb {
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

<div class="breadcrumb">
	{#if activeTab !== ''}
		<div class="breadcrumb" in:fade={{ duration: 400 }}>
			<button onclick={() => setItem('')}>
				<Icon img="img/home.svg" alt="Settings" colorVariable="--icon-white" size="16px" />
				{root_crumb}
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
</div>
