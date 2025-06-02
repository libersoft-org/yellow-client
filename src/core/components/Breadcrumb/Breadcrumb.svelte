<script lang="js">
	import { fade } from 'svelte/transition';
	import Icon from '../Icon/Icon.svelte';
	import BaseButton from '@/core/components/BaseButton/BaseButton.svelte';

	let { setItem = () => {} } = $props();

	let items = $state([]);

	export function setPath(path) {
		items = path;
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
		padding: 6px;
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
			margin: 0 5px;
			color: white;
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

{#each items as item, index}
	<div class="breadcrumbs">
		<BaseButton class="breadcrumb-button" on:click={() => setItem(item)} transition:fade={{ duration: 200 }} label={item.label} />
	</div>
{/each}
