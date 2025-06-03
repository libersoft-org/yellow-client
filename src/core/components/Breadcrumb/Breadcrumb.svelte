<script lang="js">
	import { fade } from 'svelte/transition';
	import Icon from '../Icon/Icon.svelte';

	let {
		// given breadcrumbs need to respond to .title
		root_crumb = {
			title: 'Settings',
			tab: '',
			img: '',
			onClick: () => {
				setItem(false);
			},
		},
		activeTab = $bindable(),

		setItem = () => {},
	} = $props();

	let bread_crumbs = $state([]);

	// has to be called in case if you go back one level
	export function back() {
		bread_crumbs.pop();
		return bread_crumbs[bread_crumbs.length - 1];
	}

	function findPosition(bread_crumb) {
		let position = -1;
		bread_crumbs.forEach(function callback(item, index) {
			console.log(item.title);
			if (item.title == bread_crumb.title) {
				position = index;
			}
		});
		return position;
	}

	// has to be called on change with breadcrumb that responds to .title
	export function setBreadcrumb(bread_crumb) {
		console.log(bread_crumb.title);
		let position = findPosition(bread_crumb);
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
	}
	.breadcrumb-button {
		display: flex;
		flex-direction: row;
		border: none;
		border-radius: 10px;
		background: none;
		color: var(--default-background);
		font-size: 14px;
		font-weight: bold;
		transition: color 0.3s ease;
		cursor: default;
		text-transform: capitalize;

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
					alt={bread_crumb.title}
					onclick={() => {
						setItem(bread_crumb);
					}}
				>
					<div class="breadcrumb-button-text" style="">{bread_crumb.title}</div>
				</button>
			{/each}
		</div>
	</div>
{/if}
