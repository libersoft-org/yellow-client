<script lang="js">
	import { fade } from 'svelte/transition';
	import Icon from '../Icon/Icon.svelte';
	import MenuItem from '../Menu/MenuItem.svelte';
	import { setContext } from '@sentry/sveltekit';
	import { onMount } from 'svelte';

	/* todo, refactor with Button.svelte ? */

	// import BaseButton from '@/core/components/Button/BaseButton.svelte';
	// import { autoPlacement, autoUpdate, computePosition, offset, shift } from '@floating-ui/dom';
	// import Portal from '@/core/components/Portal/Portal.svelte';

	// type Props = {
	// 	activeTab?: string;
	// 	menuItems?: Array<any>;
	// 	root_crumb?: string;
	// 	bread_crumbs: Array<any>;
	// 	setItem: any;
	// };

	// let {  } = $props();

	let {
		root_crumb = {
			title: 'Settings',
			tab: '',
			img: '',
			onClick: () => {},
		},
		activeTab = $bindable(),
		menuItems = [],
		subTab = [],
		setItem = () => {},
	} = $props();

	let bread_crumbs = $state([]);

	let items;

	// function setItem(name: string) {
	// 	activeTab = name;
	// }
	export function back() {
		bread_crumbs.pop();
		return bread_crumbs[bread_crumbs.length - 1];
	}

	export function setBreadcrumb(bread_crumb) {
		console.log(bread_crumb.title);
		let position = -1;
		bread_crumbs.forEach(function callback(item, index) {
			console.log(item.title);
			if (item.title == bread_crumb.title) {
				position = index;
			}
		});
		console.log(position);
		if (position >= 0) {
			if (position < bread_crumbs.length - 1) {
				bread_crumbs.splice(position + 1, bread_crumbs.length - position);
			}
		} else {
			bread_crumbs.push(bread_crumb);
		}
	}
</script>

<style>
	.breadcrumbs {
		display: flex;
		padding: 4px 6px;
		background: var(--default-foreground);
		margin-bottom: 0px;
		border-radius: 10px;
		/* flex-direction: row; */
	}
	.breadcrumb-button {
		display: flex;
		flex-direction: row;
		border: none;
		/* padding: 6px; */
		border-radius: 10px;
		background: none;
		color: var(--default-background);
		font-size: 14px;
		font-weight: bold;
		transition: color 0.3s ease;
		cursor: default;
		text-transform: capitalize;
		/* display: flex; */
		/* flex-direction: row; */

		&:not(:first-child)::before {
			content: '>';
			margin: 0 2px;
			color: white;
			transform: translateX(-5px);
		}

		&:last-child {
			color: white;
		}
	}
	.icon {
		padding: 0 !important;
	}
	.breadcrumb-button-text {
		display: flex;
		border: none;
		background: none;
		font-size: 14px;
		font-weight: bold;
		padding: 0;
		transition: color 0.3s ease;
		cursor: default;
		text-transform: capitalize;
		&:hover {
			/* background: var(--default-background); */
			color: var(--primary-background);
		}
	}
</style>

{#if activeTab}
	<div>
		<div class="breadcrumbs" in:fade={{ duration: 400 }}>
			<button
				class="breadcrumb-button"
				onclick={() => {
					setItem(false);
					bread_crumbs = [];
				}}
			>
				<Icon padding="0" img="img/home.svg" alt="Settings" size="16px" colorVariable="--default-background" />
				<div class="breadcrumb-button-text" style="margin-left:2px;">{root_crumb.title}</div>
			</button>

			{#each bread_crumbs as bread_crumb}
				<button
					class="breadcrumb-button"
					onclick={() => {
						// setBreadcrumb(bread_crumb);
						setItem(bread_crumb);
					}}
				>
					<div class="breadcrumb-button-text" style="">{bread_crumb.title}</div>
				</button>
			{/each}

			{#if subTab}
				<span>{subTab}</span>
			{/if}
		</div>
	</div>
{/if}
