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
		bread_crumbs = $bindable([]),

		setItem = () => {},
	} = $props();
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
